import path from 'path';
import url from 'url';
import { app, BrowserWindow } from 'electron';


app.on('ready', () => {
  BrowserWindow.addDevToolsExtension(path.join(app.getAppPath(), '../../lib/chrome'));

  new BrowserWindow({ width: 800, height: 600, icon: path.join(__dirname, 'icons/icon128.png') })
    .loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
});

app.on('window-all-closed', () => {
  app.quit();
});
