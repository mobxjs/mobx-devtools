/* eslint-disable global-require */
const ws = require('ws');
const fs = require('fs');
const path = require('path');

const log = (...a) => console.log('[Mobx DevTools]', ...a); // eslint-disable-line no-console
log.warn = (...a) => console.warn('[Mobx DevTools]', ...a); // eslint-disable-line no-console
log.error = (...a) => console.error('[Mobx DevTools]', ...a); // eslint-disable-line no-console

let restartTimeout = null;

module.exports = function startServer({ port, onConnect, onError, onDisconnect, onStarted }) {
  const httpServer = require('http').createServer();
  const server = new ws.Server({ server: httpServer });
  let connected = false;
  server.on('connection', (socket) => {
    if (connected) {
      connected.close();
      log.warn('Only one connection allowed at a time.', 'Closing the previous connection');
    }
    connected = socket;
    socket.onerror = (err) => {
      connected = false;
      onDisconnect();
      log.error('Error with websocket connection', err);
    };
    socket.onclose = () => {
      connected = false;
      onDisconnect();
      log('Connection to RN closed');
    };
    onConnect(socket);
  });

  server.on('error', (e) => {
    onError(e);
    log.error('Failed to start the DevTools server', e);
    restartTimeout = setTimeout(() => startServer(port), 1000);
  });

  const backendFile = fs.readFileSync(path.join(__dirname, '../lib/mobxDevtoolsBackend.js'));
  httpServer.on('request', (req, res) => {
    res.end(`${backendFile}\n;mobxDevtoolsBackend.connectToDevTools({});`);
  });

  httpServer.on('error', (e) => {
    onError(e);
    restartTimeout = setTimeout(() => startServer(port), 1000);
  });

  httpServer.listen(port, onStarted);

  return {
    close() {
      connected = false;
      onDisconnect();
      clearTimeout(restartTimeout);
      server.close();
      httpServer.close();
    },
  };
};
