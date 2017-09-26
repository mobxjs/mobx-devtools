const del = require('del');
const fs = require('fs');
const manifest = require('../../src/shells/webextension/manifest.json');
const path = require('path');
const { TARGET_BROWSER, NODE_ENV, npm_package_version, npm_package_description } = process.env;

if (!TARGET_BROWSER) {
  throw new Error('TARGET_BROWSER is required');
}

// Prepare folder

del.sync([`./lib/${TARGET_BROWSER}.zip`, `./lib/${TARGET_BROWSER}/**`]);
if (!fs.existsSync('./lib/')) fs.mkdirSync('./lib/');
if (!fs.existsSync(`./lib/${TARGET_BROWSER}`)) fs.mkdirSync(`./lib/${TARGET_BROWSER}`);

// Generate manifest.json

manifest.description = npm_package_description;
manifest.version = npm_package_version;
manifest.version_name = npm_package_version + (NODE_ENV === 'development' ? '-dev' : '');

if (TARGET_BROWSER === 'chrome') {
  delete manifest.applications;
}

fs.writeFileSync(
  path.join(__dirname, `../../lib/${TARGET_BROWSER}/manifest.json`),
  JSON.stringify(manifest)
);
