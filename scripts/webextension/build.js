const webpack = require('webpack');
const path = require('path');
const config = require('../../src/shells/webextension/webpack.config');
const fs = require('fs');
const archiver = require('archiver');

const { TARGET_BROWSER } = process.env;
const rootDir = path.join(__dirname, '../../');

require('./prepare');


webpack(config, (err, stats) => {
  // console.log(stats)
  if (err) throw err;
  if (stats.hasErrors()) {
    const errors = stats.toJson().errors.map(m => new Error(m));
    console.error(...errors);
    throw errors[0];
  }

  const zip = archiver.create('zip', {});
  zip.pipe(fs.createWriteStream(path.join(rootDir, `lib/${TARGET_BROWSER}.zip`)));
  zip.directory(path.join(rootDir, `./lib/${TARGET_BROWSER}/`), false).finalize();
});
