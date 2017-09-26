const webpack = require('webpack');
const config = require('./webextension.webpack.config');
const fs = require('fs');
const archiver = require('archiver');

const { TARGET_BROWSER } = process.env;

require('./prepare');

webpack(config, err => {
  if (err) throw err;

  const zip = archiver.create('zip', {});
  zip.pipe(fs.createWriteStream(`./lib/${TARGET_BROWSER}.zip`));
  zip.directory(`./lib/${TARGET_BROWSER}/`, false).finalize();
});




