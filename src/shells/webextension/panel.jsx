import debugConnection from '../../utils/debugConnection';
import initFrontend from '../../frontend';

let disconnectListener;

const inject = done => {
  // Remove the code injection part since we'll handle that differently
  let disconnected = false;

  // Get the current tab ID from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabId = urlParams.get('tabId');

  // Connect using the tab ID from URL parameters
  const port = chrome.runtime.connect({
    name: `panel_${tabId}`,
  });

  port.onDisconnect.addListener(() => {
    disconnected = true;
    if (disconnectListener) {
      disconnectListener();
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
};

initFrontend({
  node: document.getElementById('container'),
  debugName: 'Panel UI',
  inject,
  // We'll need to handle reload differently since we don't have access to chrome.devtools
  reloadSubscribe: reloadFn => {
    // Listen for reload messages from the background script
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.type === 'TAB_NAVIGATED') {
        reloadFn();
      }
    });
    return () => {
      // Cleanup listener if needed
      chrome.runtime.onMessage.removeListener(reloadFn);
    };
  },
});
