const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');
const config = require('../../src/shells/webextension/webpack.config.js');

const { TARGET_BROWSER } = process.env;
const rootDir = path.join(__dirname, '../../');

require('./prepare');

const HR_PORT = 3001;

for (const entryName in config.entry) {
  if (Object.prototype.hasOwnProperty.call(config.entry, entryName)) {
    config.entry[entryName] = [
      `webpack-dev-server/client?http://localhost:${HR_PORT}`,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(rootDir, 'lib', TARGET_BROWSER),
  headers: { 'Access-Control-Allow-Origin': '*' },
});

server.listen(HR_PORT);
