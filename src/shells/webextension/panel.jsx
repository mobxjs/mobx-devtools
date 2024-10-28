import debugConnection from '../../utils/debugConnection';
import initFrontend from '../../frontend';

let disconnectListener;

const inject = done => {
  console.log('Injecting scripts');
  const tabId = chrome.devtools.inspectedWindow.tabId;

  // First inject the content script, then the backend script
  chrome.scripting
    .executeScript({
      target: { tabId },
      files: ['/contentScript.js'],
    })
    .then(() => {
      console.log('Content script injected');
      // Wait a bit for the content script to initialize its port connection
      setTimeout(() => {
        chrome.scripting
          .executeScript({
            target: { tabId },
            files: ['/backend.js'],
          })
          .then(() => {
            console.log('Backend script injected');

            let disconnected = false;

            // Create message handlers
            const wall = {
              listen(fn) {
                // Listen for messages from the background script
                chrome.runtime.onMessage.addListener((message, sender) => {
                  if (message.tabId === tabId) {
                    debugConnection('[background -> FRONTEND]', message);
                    fn(message.data);
                  }
                });
              },
              send(data) {
                if (disconnected) return;
                debugConnection('[FRONTEND -> background]', data);
                // Send message to background script with tabId
                chrome.runtime
                  .sendMessage({
                    type: 'panel-to-backend',
                    tabId: tabId,
                    data: data,
                  })
                  .catch(err => {
                    // Ignore errors about receiving end not existing
                    if (!err.message.includes('receiving end does not exist')) {
                      console.error('Error sending message:', err);
                    }
                  });
              },
            };

            // Set up disconnect handler
            if (disconnectListener) {
              chrome.runtime.onMessage.addListener(message => {
                if (message.type === 'disconnect' && message.tabId === tabId) {
                  disconnected = true;
                  disconnectListener();
                }
              });
            }

            done(wall, () => {
              disconnected = true;
              // Notify background script about disconnect
              chrome.runtime.sendMessage({
                type: 'panel-disconnect',
                tabId: tabId,
              });
            });
          })
          .catch(err => {
            console.error('Failed to inject backend:', err);
          });
      }, 100); // Give content script time to connect
    })
    .catch(err => {
      console.error('Failed to inject content script:', err);
    });
};

initFrontend({
  node: document.getElementById('container'),
  debugName: 'Panel UI',
  inject,
  reloadSubscribe: reloadFn => {
    chrome.devtools.network.onNavigated.addListener(reloadFn);
    return () => {
      chrome.devtools.network.onNavigated.removeListener(reloadFn);
    };
  },
});
