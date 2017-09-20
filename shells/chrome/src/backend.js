/*
 * backend.js
 *
 * Injected to the app page when the panel is activated.
 */

import initBackend from '../../../src/backend';
import Bridge from '../../../src/Bridge';

function handshake(hook, contentScriptId) {
  let listeners = [];

  const bridge = new Bridge({
    listen(fn) {
      const listener = evt => {
        if (
          evt.data.source !== 'mobx-devtools-content-script' ||
          !evt.data.payload ||
          evt.data.contentScriptId !== contentScriptId
        ) {
          return;
        }
        fn(evt.data.payload);
      };
      listeners.push(listener);
      window.addEventListener('message', listener);
    },
    send(data) {
      window.postMessage({ source: 'mobx-devtools-bridge', payload: data, contentScriptId }, '*');
    }
  });

  const disposeBackend = initBackend(bridge);

  bridge.once('disconnect', () => {
    console.log('+disconnect+');
    listeners.forEach(listener => {
      window.removeEventListener('message', listener);
    });
    listeners = [];
    disposeBackend();
  });
}

window.addEventListener('message', function welcome(evt) {
  if (evt.data.source !== 'mobx-devtools-content-script') return;

  const contentScriptId = evt.data.contentScriptId;

  window.removeEventListener('message', welcome);

  // eslint-disable-next-line no-underscore-dangle
  handshake(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__, contentScriptId);
});
