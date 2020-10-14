const ip = require('ip');

const startServer = require('./startServer');

const port = process.env.PORT || 8098;
const initFrontend = require('../lib/frontend').default; // eslint-disable-line

const node = document.getElementById('container');

let onDisconnect; // eslint-disable-line
let deinitFrontend;

global.chrome = {};

document.getElementById('localhost').value = `<script src="//localhost:${port}"></script>`;
document.getElementById('byip').value = `<script src="//${ip.address()}:${port}"></script>`;

[
  document.getElementById('localhost'),
  document.getElementById('byip'),
].forEach((el) => {
  el.onclick = function onClick() {
    this.selectionStart = 0;
    this.selectionEnd = this.value.length;
  };
});

startServer({
  port,
  onStarted() {
    document.getElementById('loading-status').style.display = 'none';
  },
  onConnect(socket) {
    const listeners = [];
    socket.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      listeners.forEach((fn) => fn(data));
    };

    const wall = {
      listen(fn) {
        listeners.push(fn);
      },
      send(data) {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(data));
        }
      },
    };
    deinitFrontend = initFrontend({
      node,
      reloadSubscribe: (reloadFn) => {
        onDisconnect = () => reloadFn();
        return () => {
          onDisconnect = undefined;
        };
      },
      inject: (done) => done(wall, () => socket.close()),
    });
  },
  onError(e) {
    if (deinitFrontend) deinitFrontend();
    let message;
    if (e.code === 'EADDRINUSE') {
      message = 'Another instance of DevTools is running';
    } else {
      message = `Unknown error (${e.message})`;
    }
    setTimeout(() => {
      node.innerHTML = `<div id="waiting"><h2>${message}</h2></div>`;
    }, 10);
  },
  onDisconnect() {
    if (deinitFrontend) deinitFrontend();
    setTimeout(() => {
      node.innerHTML = '<div id="waiting"><h2>Waiting for connection…</h2></div>';
    }, 10);
  },
});
