const path = require('path');
// eslint-disable-next-line import/no-unresolved
const { app, BrowserWindow } = require('electron');

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icons/icon128.png'),
    webPreferences: {
			nodeIntegration: true,
		},
  }).loadURL(`file://${__dirname}/index.html`); // eslint-disable-line no-path-concat
});
