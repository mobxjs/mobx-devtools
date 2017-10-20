/*
 * backend.js
 *
 * Injected to the app page when panel/window is activated.
 */

import initBackend from '../../backend';
import Bridge from '../../../src/Bridge';
import debugConnection from '../../utils/debugConnection';

const backendId = Math.random()
  .toString(32)
  .slice(2);

function handshake(hook, contentScriptId) {
  let listeners = [];

  const bridge = new Bridge({
    listen(fn) {
      const listener = (evt) => {
        if (
          evt.data.source === 'mobx-devtools-content-script' &&
          evt.data.contentScriptId === contentScriptId &&
          evt.data.backendId === backendId
        ) {
          debugConnection('[contentScript -> BACKEND]', evt);
          fn(evt.data.payload);
        }
      };
      listeners.push(listener);
      window.addEventListener('message', listener);
    },
    send(data) {
      debugConnection('[BACKEND -> contentScript]', data);
      window.postMessage(
        { source: 'mobx-devtools-backend', payload: data, contentScriptId, backendId },
        '*'
      );
    },
  });

  const disposeBackend = initBackend(bridge, hook);

  bridge.once('disconnect', () => {
    debugConnection('[contentScript -x BACKEND]');
    listeners.forEach(listener => window.removeEventListener('message', listener));
    listeners = [];
    disposeBackend();
  });
}

/*
  This mechanism ensures that each content-script can be messaging with only one backend
  and vice versa:
  1. Wait for `ping`
  2. As soon as pinged, stop listening to `ping` send `pong`,
     start waiting for `hello`/`connection-fail`
  3. If received `hello`, the connection is established,
     if recieved `connection-fail`, then content-script is already busy, return to paragraph 1
*/

function waitForPing() {
  function pingListener(evt) {
    if (evt.data.source === 'mobx-devtools-content-script' && evt.data.payload === 'backend:ping') {
      debugConnection('[contentScript -> BACKEND]', evt);
      const contentScriptId = evt.data.contentScriptId;

      window.removeEventListener('message', pingListener);
      clearTimeout(handshakeFailedTimeout);

      const payload = 'contentScript:pong';
      debugConnection('[contentScript -> BACKEND]', payload);
      window.postMessage(
        { source: 'mobx-devtools-backend', payload, contentScriptId, backendId },
        '*'
      );

      const helloListener = (e) => {
        if (
          e.data.source === 'mobx-devtools-content-script' &&
          e.data.payload === 'backend:hello' &&
          e.data.contentScriptId === contentScriptId &&
          e.data.backendId === backendId
        ) {
          debugConnection('[contentScript -> BACKEND]', e);
          window.removeEventListener('message', helloListener);
          window.removeEventListener('message', failListener);
          // eslint-disable-next-line no-underscore-dangle
          handshake(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__, contentScriptId);
        }
      };

      const failListener = (e) => {
        if (
          e.data.source === 'mobx-devtools-content-script' &&
          e.data.payload === 'backend:connection-failed' &&
          e.data.contentScriptId === contentScriptId &&
          e.data.backendId === backendId
        ) {
          debugConnection('[contentScript -> BACKEND]', e);
          window.removeEventListener('message', helloListener);
          window.removeEventListener('message', failListener);
          waitForPing();
        }
      };

      window.addEventListener('message', helloListener);
      window.addEventListener('message', failListener);
    }
  }

  const handshakeFailedTimeout = setTimeout(() => {
    debugConnection('[BACKEND] handshake failed (timeout)');
    window.removeEventListener('message', pingListener);
  }, 10000);

  window.addEventListener('message', pingListener);
}

waitForPing();
