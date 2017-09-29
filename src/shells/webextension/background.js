/*
 * background.js
 *
 * Runs all the time and serves as a central message hub for panels, contentScript, backend
 */

const orphansByTabId = {};
import debugConnection from '../../utils/debugConnection';

function getActiveContentWindow(cb) {
  chrome.tabs.query({ active: true, windowType: 'normal', currentWindow: true }, d => {
    if (d.length > 0) {
      cb(d[0]);
    }
  });
}

function openWindow(contentTabId) {
  const options = {
    type: 'popup',
    url: chrome.extension.getURL('window.html#window'),
    width: 350,
    height: window.screen.availHeight,
    top: 0,
    left: window.screen.availWidth - 300
  };
  chrome.windows.create(options, win => {
    function listener(tabId) {
      if (tabId === contentTabId) {
        chrome.tabs.onRemoved.removeListener(listener);
        chrome.windows.remove(win.id);
      }
    }
    chrome.tabs.onRemoved.addListener(listener);
  });
}

function isNumeric(str) {
  return `${+str}` === str;
}

function handleInstallError(tabId, error) {
  if (__DEV__) console.warn(error);
  const orphanDevtools = orphansByTabId[tabId].find(p => !p.contentScript).map(p => p.devtools);
  orphanDevtools.forEach(d => d.postMessage('content-script-installation-error'));
}

function installContentScript(tabId) {
  chrome.tabs.get(+tabId, function(tab) {
    if (chrome.runtime.lastError) {
      handleInstallError(tabId, chrome.runtime.lastError);
    } else if (tab.status === 'complete') {
      chrome.tabs.executeScript(tabId, { file: '/contentScript.js' }, res => {
        let err = chrome.runtime.lastError;
        if (err || !res) handleInstallError(tabId, err);
      });
    } else {
      chrome.tabs.onUpdated.addListener(function listener(tid, changeInfo, tabInfo) {
        if (tid !== tabId || changeInfo.status === 'loading') return;
        chrome.tabs.onUpdated.removeListener(listener);
        installContentScript(tabId);
      });
    }
  });
}

function doublePipe(one, two) {
  if (!one.$i)
    one.$i = Math.random()
      .toString(32)
      .slice(2);
  if (!two.$i)
    two.$i = Math.random()
      .toString(32)
      .slice(2);

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

chrome.contextMenus.onClicked.addListener(({ menuItemId }, contentWindow) => {
  openWindow(contentWindow.id);
});

chrome.commands.onCommand.addListener(shortcut => {
  if (shortcut === 'open-devtools-window') {
    getActiveContentWindow(contentWindow => {
      window.contentTabId = contentWindow.id;
      openWindow(contentWindow.id);
    });
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  window.contentTabId = tab.id;
  openWindow(tab.id);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'mobx-devtools',
    title: 'Open Mobx DevTools',
    contexts: ['all']
  });
});

chrome.runtime.onConnect.addListener(port => {
  let tab = null;
  let name = null;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!orphansByTabId[tab]) {
    orphansByTabId[tab] = [];
  }

  if (name === 'content-script') {
    const orphan = orphansByTabId[tab].find(t => t.name === 'devtools');
    if (orphan) {
      doublePipe(orphan.port, port);
      orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== orphan);
    } else {
      const orphan = { name, port };
      orphansByTabId[tab].push(orphan);
      port.onDisconnect.addListener(() => {
        if (__DEV__) console.warn('orphan devtools disconnected');
        orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== orphan);
      });
    }
  } else if (name === 'devtools') {
    const orphan = orphansByTabId[tab].find(t => t.name === 'content-script');
    if (orphan) {
      orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== orphan);
    } else {
      const orphan = { name, port };
      orphansByTabId[tab].push(orphan);
      port.onDisconnect.addListener(() => {
        if (__DEV__) console.warn('orphan content-script disconnected');
        orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== orphan);
      });
    }
  }
});
