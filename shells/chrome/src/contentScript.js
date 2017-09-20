/*
 * contentScript.js
 *
 * This is a content-script that is injected only when the devtools are
 * activated. Because it is not injected using eval, it has full privilege
 * to the chrome runtime API. It serves as a proxy between the injected
 * backend and the devtools panel.
 */

const contentScriptId = Math.random()
  .toString(32)
  .slice(2);

// proxy from main page to devtools (via the background page)
const port = chrome.runtime.connect({ name: 'content-script' });

function sendMessageToBackend(payload) {
  window.postMessage({ source: 'mobx-devtools-content-script', payload, contentScriptId }, '*');
}

function handleMessageFromDevtools(message) {
  sendMessageToBackend(message);
}

function handleMessageFromPage(evt) {
  if (
    evt.data &&
    evt.data.source === 'mobx-devtools-bridge' &&
    evt.data.contentScriptId === contentScriptId
  ) {
    port.postMessage(evt.data.payload);
  }
}

function handleDisconnect() {
  window.removeEventListener('message', handleMessageFromPage);
  sendMessageToBackend({
    type: 'event',
    evt: 'disconnect'
  });
}

port.onMessage.addListener(handleMessageFromDevtools);
port.onDisconnect.addListener(handleDisconnect);

window.addEventListener('message', handleMessageFromPage);

sendMessageToBackend();
