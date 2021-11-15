import debugConnection from '../../utils/debugConnection';

/*
 * background.js
 *
 * Runs all the time and serves as a central message hub for panels, contentScript, backend
 */
const orphansByTabId = {};

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
      chrome.tabs.executeScript(tabId, { file: '/contentScript.js' }, res => {
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

// When chrome.runtime.connect is called, callback below will be called
// Which files call chrome.runtime.connect?👇🏻
// contentScript.js/panel.jsx
chrome.runtime.onConnect.addListener(port => {
  let tab = null;
  let name = null;

  // port.name = 3623 or 'content-script'
  // console.log('port.name:', port.name);
  // when the port.name is a number,and then load contentScript.js

  // when port.name is a number(e.g. 3623), panel.jsx has called chrome.runtime.connect() func
  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    // when prot.name is not a number(e.g. "content-script"), contentScript.js has called chrome.runtime.connect() func
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
      const newOrphan = { name, port };
      orphansByTabId[tab].push(newOrphan);
      port.onDisconnect.addListener(() => {
        if (__DEV__) console.warn('orphan devtools disconnected'); // eslint-disable-line no-console
        orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== newOrphan);
      });
    }
  } else if (name === 'devtools') {
    const orphan = orphansByTabId[tab].find(t => t.name === 'content-script');
    if (orphan) {
      orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== orphan);
    } else {
      const newOrphan = { name, port };
      orphansByTabId[tab].push(newOrphan);
      port.onDisconnect.addListener(() => {
        if (__DEV__) console.warn('orphan content-script disconnected'); // eslint-disable-line no-console
        orphansByTabId[tab] = orphansByTabId[tab].filter(t => t !== newOrphan);
      });
    }
  }
});
