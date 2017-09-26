const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webextension.webpack.config.js');
const path = require('path');
const { TARGET_BROWSER, HR_PORT = 3000 } = process.env;

require('./prepare');

for (let entryName in config.entry) {
  config.entry[entryName] = [
    'webpack-dev-server/client?http://localhost:' + HR_PORT,
    'webpack/hot/dev-server'
  ].concat(config.entry[entryName]);
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(__dirname, '../lib/', TARGET_BROWSER),
  headers: { 'Access-Control-Allow-Origin': '*' }
});

server.listen(HR_PORT);
