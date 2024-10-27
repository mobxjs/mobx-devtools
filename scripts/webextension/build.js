const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const config = require('../../src/shells/webextension/webpack.config');

const { TARGET_BROWSER } = process.env;
const rootDir = path.join(__dirname, '../../');

require('./prepare');

const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    // Handle fatal webpack errors (e.g., configuration errors)
    console.error('Webpack fatal error:', err);
    process.exit(1);
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    // Handle compilation errors
    console.error('Webpack compilation errors:');
    info.errors.forEach(error => {
      console.error(error);
    });
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    // Handle compilation warnings
    console.warn('Webpack compilation warnings:');
    info.warnings.forEach(warning => {
      console.warn(warning);
    });
  }

  // Proceed to create the zip archive
  const output = fs.createWriteStream(path.join(rootDir, `lib/${TARGET_BROWSER}.zip`));
  const archive = archiver('zip', {});

  archive.on('error', function (archiveErr) {
    console.error('Archiving error:', archiveErr);
    process.exit(1);
  });

  archive.pipe(output);
  archive.directory(path.join(rootDir, `./lib/${TARGET_BROWSER}/`), false);
  archive.finalize();
});
