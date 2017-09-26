const webpack = require('webpack');
const config = require('./webextension.webpack.config');
const { TARGET_BROWSER } = process.env;

require('./prepare');

webpack(config, err => {
  if (err) throw err;

  const fs = require('fs');
  const archiver = require('archiver');

  const archive = archiver.create('zip', {});
  const output = fs.createWriteStream(`./lib/${TARGET_BROWSER}.zip`);

  archive.pipe(output);

  archive
    .directory(`./lib/${TARGET_BROWSER}/`, false)
    .finalize();
});




