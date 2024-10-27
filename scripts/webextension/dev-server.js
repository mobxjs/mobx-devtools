const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const config = require('../../src/shells/webextension/webpack.config.js');

const { TARGET_BROWSER } = process.env;
const rootDir = path.join(__dirname, '../../');

require('./prepare');

const HR_PORT = 3001;

const compiler = webpack(config);

const server = new WebpackDevServer(
  {
    port: HR_PORT,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: {
      directory: path.join(rootDir, 'lib', TARGET_BROWSER),
    },
    client: {
      webSocketURL: `ws://localhost:${HR_PORT}/ws`,
    },
  },
  compiler,
);

server.startCallback(() => {
  console.log(`Dev server is running on http://localhost:${HR_PORT}`);
});
