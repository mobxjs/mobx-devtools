import initBackend from '../../../src/backend';
import Bridge from '../../../src/Bridge';
import debugConnection from '../../../src/utils/debugConnection';

import installGlobalHook from '../../../src/backend/utils/installGlobalHook';

installGlobalHook(window);
const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__; // eslint-disable-line no-underscore-dangle

const connectToDevTools = options => {
  const { host = 'localhost', port = 8098 } = options;
  const messageListeners = [];
  const uri = `ws://${host}:${port}`;
  const ws = new window.WebSocket(uri);
  ws.onclose = handleClose;
  ws.onerror = handleClose;
  ws.onmessage = handleMessage;
  ws.onopen = () => {
    let listeners = [];

    const bridge = new Bridge({
      listen(fn) {
        messageListeners.push(fn);
      },
      send(data) {
        ws.send(JSON.stringify(data));
      },
    });

    const disposeBackend = initBackend(bridge, hook);

    bridge.once('disconnect', () => {
      debugConnection('[contentScript -x BACKEND]');
      listeners.forEach(listener => window.removeEventListener('message', listener));
      listeners = [];
      disposeBackend();
    });
  };

  let hasClosed = false;
  function handleClose() {
    if (!hasClosed) {
      hasClosed = true;
      setTimeout(() => connectToDevTools(options), 2000);
    }
  }

  function handleMessage(evt) {
    let data;
    try {
      data = JSON.parse(evt.data);
    } catch (e) {
      if (__DEV__) {
        console.error(e); // eslint-disable-line no-console
      }
      return;
    }
    messageListeners.forEach(fn => {
      try {
        fn(data);
      } catch (e) {
        if (__DEV__) {
          console.error(e); // eslint-disable-line no-console
        }
        throw e;
      }
    });
  }
};

module.exports = { connectToDevTools };
