import initFrontend from '../../frontend';
import debugConnection from '../../utils/debugConnection';

let onDisconnect;

const whenTabLoaded = (tabId, cb) => {
  chrome.tabs.get(tabId, tab => {
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
    console.log('Injecting content script');
    const code = `
          // the prototype stuff is in case document.createElement has been modified
          var script = document.constructor.prototype.createElement.call(document, 'script');
          script.src = "${chrome.runtime.getURL('backend.js')}";
          document.documentElement.appendChild(script);
          script.parentNode.removeChild(script);
        `;
    chrome.tabs.executeScript(contentTabId, { code }, () => {
      console.log('Content script injected');
      let disconnected = false;

      const port = chrome.runtime.connect({
        name: `${contentTabId}`,
      });

      port.onDisconnect.addListener(() => {
        console.log('Port disconnected');
        debugConnection('[background -x FRONTEND]');
        disconnected = true;
        if (onDisconnect) {
          onDisconnect();
        }
      });

      const wall = {
        listen(fn) {
          console.log('Listening for messages');
          port.onMessage.addListener(message => {
            console.log('Received message:', message);
            debugConnection('[background -> FRONTEND]', message);
            fn(message);
          });
        },
        send(data) {
          if (disconnected) return;
          console.log('Sending message:', data);
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
    reloadSubscribe: reloadFn => {
      onDisconnect = () => reloadFn();
      return () => {
        onDisconnect = undefined;
      };
    },
    inject: done => inject(contentTabId, done),
  }),
);
