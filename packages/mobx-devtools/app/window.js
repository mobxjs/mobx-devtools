const startServer = require('./startServer');
const port = process.env.PORT || 8098;
const initFrontend = require('../lib/frontend').default;
const node = document.getElementById('container');

let onDisconnect;
let deinitFrontend;

global.chrome = {};

const stopServer = startServer({
  port,
  onConnect(socket) {
    var listeners = [];
    socket.onmessage = (evt) => {
      var data = JSON.parse(evt.data);
      listeners.forEach((fn) => fn(data));
    };

    wall = {
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
      inject: done => done(wall, () => socket.close()),
    });
  },
  onError(e) {
    if (deinitFrontend) deinitFrontend();
    var message;
    if (e.code === 'EADDRINUSE') {
      message = 'Another instance of DevTools is running';
    } else {
      message = `Unknown error (${e.message})`;
    }
    setTimeout(() => {
      node.innerHTML = `<div id="waiting"><h2>${message}</h2></div>`;
    }, 10)
  },
  onDisconnect() {
    if (deinitFrontend) deinitFrontend();
    setTimeout(() => {
      node.innerHTML = '<div id="waiting"><h2>Waiting for connection…</h2></div>';
    }, 10)
  },
});

