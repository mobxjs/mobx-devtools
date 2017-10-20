const webpack = require('webpack');
const path = require('path');
const config = require('../../src/shells/webextension/webpack.config');
const fs = require('fs');
const archiver = require('archiver');

const { TARGET_BROWSER } = process.env;
const rootDir = path.join(__dirname, '../../');

require('./prepare');


webpack(config, (err) => {
  if (err) throw err;

  const zip = archiver.create('zip', {});
  zip.pipe(fs.createWriteStream(path.join(rootDir, `lib/${TARGET_BROWSER}.zip`)));
  zip.directory(path.join(rootDir, `./lib/${TARGET_BROWSER}/`), false).finalize();
});

