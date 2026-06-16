import initFrontend from '../../frontend';
import debugConnection from '../../utils/debugConnection';

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
              const wall = {
                listen(fn) {
                  chrome.runtime.onMessage.addListener((message, _sender) => {
                    if (message.tabId === contentTabId) {
                      debugConnection('[background -> FRONTEND]', message);
                      fn(message.data);
                    }
                  });
                },
                send(data) {
                  debugConnection('[FRONTEND -> background]', data);
                  chrome.runtime
                    .sendMessage({
                      type: 'panel-to-backend',
                      tabId: contentTabId,
                      data,
                    })
                    .catch(err => {
                      console.error('Error sending from window:', err);
                    });
                },
              };

              setTimeout(() => {
                wall.send('backend:ping');
              }, 1000);

              done(wall, () => {
                chrome.runtime.sendMessage({
                  type: 'panel-disconnect',
                  tabId: contentTabId,
                });
              });
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

chrome.runtime.sendMessage({ type: 'get-content-tab-id' }, ({ contentTabId }) =>
  initFrontend({
    node: document.getElementById('container'),
    debugName: 'Window UI',
    reloadSubscribe: () => () => {},
    inject: done => inject(contentTabId, done),
  }),
);
