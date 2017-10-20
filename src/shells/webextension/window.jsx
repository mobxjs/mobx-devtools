/* global chrome */

import initFrontend from '../../frontend';
import debugConnection from '../../utils/debugConnection';

let onDisconnect;

const whenTabLoaded = (tabId, cb) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.status !== 'loading') {
      cb();
      return;
    }
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        cb();
      }
    });
  });
};

const inject = (contentTabId, done) =>
  whenTabLoaded(contentTabId, () => {
    const code = `
          // the prototype stuff is in case document.createElement has been modified
          var script = document.constructor.prototype.createElement.call(document, 'script');
          script.src = "${chrome.runtime.getURL('backend.js')}";
          document.documentElement.appendChild(script);
          script.parentNode.removeChild(script);
        `;
    chrome.tabs.executeScript(contentTabId, { code }, () => {
      let disconnected = false;

      const port = chrome.runtime.connect({
        name: `${contentTabId}`,
      });

      port.onDisconnect.addListener(() => {
        debugConnection('[background -x FRONTEND]');
        disconnected = true;
        if (onDisconnect) {
          onDisconnect();
        }
      });

      const wall = {
        listen(fn) {
          port.onMessage.addListener((message) => {
            debugConnection('[background -> FRONTEND]', message);
            fn(message);
          });
        },
        send(data) {
          if (disconnected) return;
          debugConnection('[FRONTEND -> background]', data);
          port.postMessage(data);
        },
      };
      done(wall, () => port.disconnect());
    });
  });

chrome.runtime.getBackgroundPage(({ contentTabId }) =>
  initFrontend({
    node: document.getElementById('container'),
    debugName: 'Window UI',
    reloadSubscribe: (reloadFn) => {
      onDisconnect = () => reloadFn();
      return () => {
        onDisconnect = undefined;
      };
    },
    inject: done => inject(contentTabId, done),
  })
);
