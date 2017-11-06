const { makeConfig } = require('./webpack');

module.exports = makeConfig({
  plainDevtool: Boolean(process.env.PLAIN_DEVTOOL),
});
