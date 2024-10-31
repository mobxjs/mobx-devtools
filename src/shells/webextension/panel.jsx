import debugConnection from '../../utils/debugConnection';
import initFrontend from '../../frontend';

let disconnectListener;

const inject = done => {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  // First inject the content script, then the backend script
  chrome.scripting
    .executeScript({
      target: { tabId },
      files: ['/contentScript.js'],
    })
    .then(() => {
      // Wait a bit for the content script to initialize its port connection
      setTimeout(() => {
        chrome.scripting
          .executeScript({
            target: { tabId },
            files: ['/backend.js'],
            world: 'MAIN',
          })
          .then(() => {
            let disconnected = false;

            // Create message handlers
            const wall = {
              listen(fn) {
                chrome.runtime.onMessage.addListener((message, sender) => {
                  if (message.tabId === tabId) {
                    debugConnection('[background -> FRONTEND]', message);
                    fn(message.data);
                  }
                });
              },
              send(data) {
                chrome.runtime
                  .sendMessage({
                    type: 'panel-to-backend',
                    tabId: tabId,
                    data: data,
                  })
                  .catch(err => {
                    console.error('Error sending from panel:', err);
                  });
              },
            };

            // Send ping after small delay to ensure listeners are set up
            setTimeout(() => {
              wall.send('backend:ping');
            }, 1000);

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
