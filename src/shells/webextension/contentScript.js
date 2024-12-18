/*
 * contentScript.js
 *
 * This is a content-script that is injected only when the devtools are
 * activated. Because it is not injected using eval, it has full privilege
 * to the chrome runtime API. It serves as a proxy between the injected
 * backend and the devtools panel.
 */

import debugConnection from '../../utils/debugConnection';

const contentScriptId = Math.random().toString(32).slice(2);

// proxy from main page to devtools (via the background page)
let port = chrome.runtime.connect({ name: 'content-script' });

// Handle port disconnection and reconnection
port.onDisconnect.addListener(() => {
  // Try to reconnect after a short delay
  setTimeout(() => {
    const newPort = chrome.runtime.connect({ name: 'content-script' });
    // Update port reference
    port = newPort;
  }, 100);
});

const handshake = backendId => {
  function sendMessageToBackend(payload) {
    debugConnection('[backgrond -> CONTENTSCRIPT -> backend]', payload);
    window.postMessage(
      {
        source: 'mobx-devtools-content-script',
        payload,
        contentScriptId,
        backendId,
      },
      '*',
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
      eventName: 'disconnect',
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
let backendId;

window.addEventListener('message', function listener(message) {
  if (
    message.data.source === 'mobx-devtools-backend' &&
    message.data.payload === 'contentScript:pong' &&
    message.data.contentScriptId === contentScriptId
  ) {
    debugConnection('[backend -> CONTENTSCRIPT]', message);
    backendId = message.data.backendId;
    clearTimeout(handshakeFailedTimeout);
    clearInterval(pingInterval);
    debugConnection('[CONTENTSCRIPT -> backend]', 'backend:hello');
    window.postMessage(
      {
        source: 'mobx-devtools-content-script',
        payload: connected ? 'backend:connection-failed' : 'backend:hello',
        contentScriptId,
        backendId,
      },
      '*',
    );

    if (!connected) {
      connected = true;
      handshake(backendId);
    }

    setTimeout(() => window.removeEventListener('message', listener), 50000);
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'panel-message') {
    // Forward to backend
    window.postMessage(
      {
        source: 'mobx-devtools-content-script',
        payload: message.data,
        contentScriptId,
      },
      '*',
    );
    // Send immediate response to avoid channel closing
    sendResponse({ received: true });
  }
  // Return false to indicate we won't send an async response
  return false;
});

// Handle messages from backend
window.addEventListener('message', evt => {
  if (evt.data.source === 'mobx-devtools-backend' && evt.data.contentScriptId === contentScriptId) {
    // Forward to panel via background script
    try {
      chrome.runtime
        .sendMessage({
          type: 'content-to-panel',
          data: evt.data.payload,
        })
        .catch(() => {
          // Ignore "receiving end does not exist" errors silently
        });
    } catch (err) {
      // Ignore chrome.runtime not available errors
      console.debug('Failed to send message:', err);
    }
  }
});

// Consolidate duplicate port message listeners into one
port.onMessage.addListener(message => {
  if (message.type === 'panel-message') {
    window.postMessage(
      {
        source: 'mobx-devtools-content-script',
        payload: message.data,
        contentScriptId,
        backendId,
      },
      '*',
    );
  }
});
