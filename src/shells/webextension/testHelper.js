// Isolated-world content script: bridges test events from the page to the background service worker.
// This runs in the default ISOLATED world, so chrome.runtime APIs are available.
if (__TEST__) {
  document.documentElement.setAttribute('data-mobx-devtools-loaded', 'true');
  window.addEventListener('test-open-mobx-devtools-window', () => {
    document.documentElement.setAttribute('data-mobx-devtools-event', 'received');
    chrome.runtime.sendMessage({ eventName: 'open-mobx-devtools-window' }, () => {
      if (chrome.runtime.lastError) {
        document.documentElement.setAttribute(
          'data-mobx-devtools-send-error',
          chrome.runtime.lastError.message,
        );
      } else {
        document.documentElement.setAttribute('data-mobx-devtools-event', 'sent');
      }
    });
  });
}
