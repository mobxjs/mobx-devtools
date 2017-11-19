const { makeConfig } = require('./webpack.makeConfig');

module.exports = makeConfig({
  plainDevtool: Boolean(process.env.PLAIN_DEVTOOL),
});
