/*
 * contentScript.js
 *
 * This is a content-script that is injected only when the devtools are
 * activated. Because it is not injected using eval, it has full privilege
 * to the chrome runtime API. It serves as a proxy between the injected
 * backend and the devtools panel.
 */

import debugConnection from '../../../src/debugConnection';

const contentScriptId = Math.random()
  .toString(32)
  .slice(2);

// proxy from main page to devtools (via the background page)
const port = chrome.runtime.connect({ name: 'content-script' });

const handshake = backendId => {
  function sendMessageToBackend(payload) {
    debugConnection('[backgrond -> CONTENTSCRIPT -> backend]', payload);
    window.postMessage(
      { source: 'mobx-devtools-content-script', payload, contentScriptId, backendId },
      '*'
    );
  }

  function handleMessageFromDevtools(message) {
    sendMessageToBackend(message);
  }

  function handleMessageFromPage(evt) {
    if (
      evt.data.source === 'mobx-devtools-backend' &&
      evt.data.contentScriptId === contentScriptId &&
      evt.data.backendId === backendId
    ) {
      debugConnection('[backend -> CONTENTSCRIPT -> backgrond]', evt);
      evt.data.payload.contentScriptId = contentScriptId;
      port.postMessage(evt.data.payload);
    }
  }

  function handleDisconnect() {
    debugConnection('[backgrond -x CONTENTSCRIPT]');
    window.removeEventListener('message', handleMessageFromPage);
    sendMessageToBackend({
      type: 'event',
      eventName: 'disconnect'
    });
  }

  port.onMessage.addListener(handleMessageFromDevtools);
  port.onDisconnect.addListener(handleDisconnect);

  window.addEventListener('message', handleMessageFromPage);
};

/*
 Start pinging backend (see backend.js for explanation)
*/

const sendPing = () => {
  const payload = 'backend:ping';
  debugConnection('[CONTENTSCRIPT -> backend]', payload);
  window.postMessage({ source: 'mobx-devtools-content-script', payload, contentScriptId }, '*');
};

sendPing();
const pingInterval = setInterval(sendPing, 500);
const handshakeFailedTimeout = setTimeout(() => {
  debugConnection('[CONTENTSCRIPT] handshake failed (timeout)');
  clearInterval(pingInterval);
}, 500 * 20);

let connected = false;

window.addEventListener('message', function listener(message) {
  if (
    message.data.source === 'mobx-devtools-backend' &&
    message.data.payload === 'contentScript:pong' &&
    message.data.contentScriptId === contentScriptId
  ) {
    debugConnection('[backend -> CONTENTSCRIPT]', message);
    const backendId = message.data.backendId;
    clearTimeout(handshakeFailedTimeout);
    clearInterval(pingInterval);
    debugConnection('[CONTENTSCRIPT -> backend]', 'backend:hello');
    window.postMessage(
      {
        source: 'mobx-devtools-content-script',
        payload: connected ? 'backend:connection-failed' : 'backend:hello',
        contentScriptId,
        backendId
      },
      '*'
    );

    if (!connected) {
      connected = true;
      handshake(backendId);
    }

    setTimeout(() => window.removeEventListener('message', listener), 50000);
  }
});
