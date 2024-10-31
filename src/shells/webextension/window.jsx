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
    // First inject content script
    chrome.scripting
      .executeScript({
        target: { tabId: contentTabId },
        files: ['/contentScript.js'],
      })
      .then(() => {
        // Wait a bit for content script to initialize
        setTimeout(() => {
          // Then inject backend
          chrome.scripting
            .executeScript({
              target: { tabId: contentTabId },
              files: ['/backend.js'],
              world: 'MAIN',
            })
            .then(() => {
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
                  port.onMessage.addListener(message => {
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
            })
            .catch(err => {
              console.error('Failed to inject backend:', err);
            });
        }, 100);
      })
      .catch(err => {
        console.error('Failed to inject content script:', err);
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
