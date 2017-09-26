const webpack = require('webpack');
const config = require('./webpack.config');
const fs = require('fs');

webpack(config, err => {
  if (err) throw err;
  fs.createReadStream('./src/shells/react/index.d.ts').pipe(fs.createWriteStream('./lib/react/index.d.ts'));
});




