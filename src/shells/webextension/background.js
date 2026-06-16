/*
 * background.js
 *
 * Runs as a service worker serves as a central message hub for panels, contentScript, backend
 */

if (__TEST__) {
  const listener = (evt, { tab }) => {
    if (evt.eventName === 'open-mobx-devtools-window') {
      contentTabId = tab.id;
      openWindow(tab.id);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
}

let contentTabId;

const orphansByTabId = {};

function getActiveContentWindow(cb) {
  chrome.tabs.query({ active: true, windowType: 'normal', currentWindow: true }, d => {
    if (d.length > 0) {
      cb(d[0]);
    }
  });
}

function openWindow(tabId) {
  const devtoolWidth = 450;
  // Open devtools window
  chrome.windows.create(
    {
      type: 'popup',
      url: chrome.runtime.getURL('window.html#window'),
      width: devtoolWidth,
      height: 800,
    },
    win => {
      function closeListener(removedTabId) {
        if (removedTabId === tabId || removedTabId === win.tabs[0].id) {
          chrome.tabs.onRemoved.removeListener(closeListener);
          chrome.windows.remove(win.id);
        }
      }
      chrome.tabs.onRemoved.addListener(closeListener);
    },
  );
}

function handleInstallError(tabId, error) {
  if (__DEV__) console.warn(error); // eslint-disable-line no-console
  const orphanDevtools = orphansByTabId[tabId]
    .filter(p => !p.contentScript && p.devtools !== undefined)
    .map(p => p.devtools);
  orphanDevtools.forEach(d => d.postMessage('content-script-installation-error'));
}

const waitTabLoad = (tabId, cb) => {
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
        contentTabId = tab.id;
        installContentScript(tab.id);
        openWindow(tab.id);
      } catch (err) {
        console.error('Error opening devtools window:', err);
      }
    }
  });
}

if (chrome.commands) {
  chrome.commands.onCommand.addListener(shortcut => {
    if (shortcut === 'open-devtools-window') {
      getActiveContentWindow(contentWindow => {
        contentTabId = contentWindow.id;
        openWindow(contentWindow.id);
      });
    }
  });
}

if (chrome.action) {
  chrome.action.onClicked.addListener(tab => {
    contentTabId = tab.id;
    openWindow(tab.id);
  });
}

const contentScriptPorts = new Map();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'content-script') {
    const tabId = port.sender.tab.id;
    contentScriptPorts.set(tabId, port);
    port.onDisconnect.addListener(() => {
      contentScriptPorts.delete(tabId);
    });
  }
});

// Respond with contentTabId for the devtools window
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get-content-tab-id') {
    sendResponse({ contentTabId });
    return;
  }
});

// Handle messages from panel
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
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
