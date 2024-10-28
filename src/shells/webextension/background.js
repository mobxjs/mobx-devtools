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

function doublePipe(one, two) {
  if (!one.$i) {
    one.$i = Math.random().toString(32).slice(2);
  }
  if (!two.$i) {
    two.$i = Math.random().toString(32).slice(2);
  }

  debugConnection(`BACKGORUND: connect ${one.name} <-> ${two.name} [${one.$i} <-> ${two.$i}]`);

  function lOne(message) {
    debugConnection(`${one.name} -> BACKGORUND -> ${two.name} [${one.$i}-${two.$i}]`, message);
    try {
      two.postMessage(message);
    } catch (e) {
      if (__DEV__) console.error('Unexpected disconnect, error', e); // eslint-disable-line no-console
      shutdown(); // eslint-disable-line no-use-before-define
    }
  }
  function lTwo(message) {
    debugConnection(`${two.name} -> BACKGORUND -> ${one.name} [${two.$i}-${one.$i}]`, message);
    try {
      one.postMessage(message);
    } catch (e) {
      if (__DEV__) console.error('Unexpected disconnect, error', e); // eslint-disable-line no-console
      shutdown(); // eslint-disable-line no-use-before-define
    }
  }
  one.onMessage.addListener(lOne);
  two.onMessage.addListener(lTwo);
  function shutdown() {
    debugConnection(`SHUTDOWN ${one.name} <-> ${two.name} [${one.$i} <-> ${two.$i}]`);
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}

if (chrome.contextMenus) {
  // electron doesn't support this api
  chrome.contextMenus.onClicked.addListener((_, contentWindow) => {
    openWindow(contentWindow.id);
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'mobx-devtools',
    title: 'Open Mobx DevTools',
    contexts: ['all'],
  });
});

// Keep service worker alive
chrome.runtime.onConnect.addListener(port => {
  console.log('Service worker connected to port:', port.name);
});

// Create a long-lived connection for the content script
let contentScriptPorts = new Map();

chrome.runtime.onConnect.addListener(port => {
  console.log('New connection:', port.name);

  if (port.name === 'content-script') {
    const tabId = port.sender.tab.id;
    contentScriptPorts.set(tabId, port);

    port.onDisconnect.addListener(() => {
      console.log('Content script disconnected:', tabId);
      contentScriptPorts.delete(tabId);
    });
  }
});

// Handle messages from panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'panel-to-backend') {
    const port = contentScriptPorts.get(message.tabId);
    if (port) {
      // Use the existing port to send to content script
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
