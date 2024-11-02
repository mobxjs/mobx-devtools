import debugConnection from '../../utils/debugConnection';

/*
 * background.js
 *
 * Runs as a service worker serves as a central message hub for panels, contentScript, backend
 */

if (process.env.NODE_ENV === 'test') {
  const listener = (evt, { tab }) => {
    if (evt.eventName === 'open-mobx-devtools-window') {
      window.contentTabId = tab.id;
      openWindow(tab.id);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
}

const orphansByTabId = {};

function getActiveContentWindow(cb) {
  chrome.tabs.query({ active: true, windowType: 'normal', currentWindow: true }, d => {
    if (d.length > 0) {
      cb(d[0]);
    }
  });
}

function openWindow(contentTabId) {
  const devtoolWidth = window.screen.availWidth > 1366 ? 450 : 420;
  // Resize main window
  chrome.windows.getCurrent(wind => {
    if (wind.left + wind.width > window.screen.availWidth - devtoolWidth) {
      const newWidth = Math.min(window.screen.availWidth - devtoolWidth, wind.width);
      chrome.windows.update(wind.id, {
        left: window.screen.availWidth - devtoolWidth - newWidth,
        top: wind.top,
        width: newWidth,
        height: wind.height,
      });
    }
  });
  // Open devtools window
  chrome.windows.create(
    {
      type: 'popup',
      url: chrome.extension.getURL('window.html#window'),
      width: devtoolWidth,
      height: window.screen.availHeight,
      top: 0,
      left: window.screen.availWidth - devtoolWidth,
    },
    win => {
      function closeListener(tabId) {
        if (tabId === contentTabId || tabId === win.tabs[0].id) {
          chrome.tabs.onRemoved.removeListener(closeListener);
          chrome.windows.remove(win.id);
        }
      }
      chrome.tabs.onRemoved.addListener(closeListener);
    },
  );
}

function isNumeric(str) {
  return `${+str}` === str;
}

function handleInstallError(tabId, error) {
  if (__DEV__) console.warn(error); // eslint-disable-line no-console
  const orphanDevtools = orphansByTabId[tabId]
    .filter(p => !p.contentScript && p.devtools !== undefined)
    .map(p => p.devtools);
  orphanDevtools.forEach(d => d.postMessage('content-script-installation-error'));
}

const waitTabLoad = (tabId, cb) => {
  if (!chrome.tabs.get) {
    // electron doesn't support this api
    cb();
    return;
  }
  chrome.tabs.get(+tabId, tab => {
    if (chrome.runtime.lastError) {
      cb(chrome.runtime.lastError);
    } else if (tab.status === 'complete') {
      cb();
    } else {
      chrome.tabs.onUpdated.addListener(function listener(tid, changeInfo) {
        if (tid !== tabId || changeInfo.status === 'loading') return;
        chrome.tabs.onUpdated.removeListener(listener);
        cb();
      });
    }
  });
};

const installContentScript = tabId => {
  waitTabLoad(+tabId, err => {
    if (err) {
      handleInstallError(tabId, err);
    } else {
      chrome.scripting.executeScript({ target: { tabId }, files: ['/backend.js'] }, res => {
        const installError = chrome.runtime.lastError;
        if (err || !res) handleInstallError(tabId, installError);
      });
    }
  });
};

if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Context menu clicked', info, tab);
    if (info.menuItemId === 'mobx-devtools') {
      try {
        console.log('Attempting to open window for tab', tab.id);
        window.contentTabId = tab.id;
        installContentScript(tab.id);
        openWindow(tab.id);
      } catch (err) {
        console.error('Error opening devtools window:', err);
      }
    }
  });
}

if (chrome.commands) {
  // electron doesn't support this api
  chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut === 'open-devtools-window') {
      getActiveContentWindow(contentWindow => {
        window.contentTabId = contentWindow.id;
        openWindow(contentWindow.id);
      });
    }
  });
}

if (chrome.browserAction) {
  // electron doesn't support this api
  chrome.browserAction.onClicked.addListener(tab => {
    window.contentTabId = tab.id;
    openWindow(tab.id);
  });
}

// Keep service worker alive
chrome.runtime.onConnect.addListener(port => {
  console.log('Service worker connected to port:', port.name);
});

// Create a long-lived connection for the content script
let contentScriptPorts = new Map();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'content-script') {
    const tabId = port.sender.tab.id;
    contentScriptPorts.set(tabId, port);

    port.onDisconnect.addListener(() => {
      contentScriptPorts.delete(tabId);
    });
  }
});

// Handle messages from panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'panel-to-backend') {
    // Use the existing port to send to content script
    const port = contentScriptPorts.get(message.tabId);
    if (port) {
      port.postMessage({
        type: 'panel-message',
        data: message.data,
      });
    } else {
      console.error('No connection to content script for tab:', message.tabId);
    }
  }
  // Return true to indicate we'll respond asynchronously
  return true;
});

// Handle messages from content script to panel
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab && message.type === 'content-to-panel') {
    // Broadcast to all extension pages
    chrome.runtime
      .sendMessage({
        tabId: sender.tab.id,
        data: message.data,
      })
      .catch(err => {
        // Ignore errors about receiving end not existing
        if (!err.message.includes('receiving end does not exist')) {
          console.error('Error sending message:', err);
        }
      });
  }
});
