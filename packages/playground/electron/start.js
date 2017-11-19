const path = require('path');
const childProcess = require('child_process');
const electron = require('electron');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

webpackConfig.entry.electronBackground = path.resolve(__dirname, 'background.js');
webpackConfig.externals = {
  electron: 'require("electron")',
  net: 'require("net")',
  remote: 'require("remote")',
  shell: 'require("shell")',
  app: 'require("app")',
  ipc: 'require("ipc")',
  fs: 'require("fs")',
  buffer: 'require("buffer")',
  system: '{}',
  file: '{}',
};

const compiler = webpack(webpackConfig);
let electronStarted = false;

const watching = compiler.watch({}, (err, stats) => {
  if (err) {
    console.error(err); // eslint-disable-line no-console
    throw err;
  }
  if (stats.hasErrors()) {
    console.error(stats.toJson().errors); // eslint-disable-line no-console
    throw stats.toJson().errors[0];
  }
  if (!err && !stats.hasErrors() && !electronStarted) {
    electronStarted = true;
    childProcess
      .spawn(electron, ['.'], { stdio: 'inherit' })
      .on('close', () => {
        watching.close();
      });
  }
});
