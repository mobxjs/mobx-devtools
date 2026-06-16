/* eslint-disable camelcase */
const del = require('del');
const fs = require('fs');
const path = require('path');
const manifest = require('../../src/shells/webextension/manifest.json');
const rootPkg = require('../../package.json');

const { TARGET_BROWSER, NODE_ENV } = process.env;

const rootDir = path.join(__dirname, '../../');

if (!TARGET_BROWSER) {
  throw new Error('TARGET_BROWSER is required');
}

// Prepare folder

del.sync([
  path.join(rootDir, `lib/${TARGET_BROWSER}.zip`),
  path.join(rootDir, `lib/${TARGET_BROWSER}/**`),
]);
if (!fs.existsSync(path.join(rootDir, 'lib'))) fs.mkdirSync(path.join(rootDir, 'lib'));
if (!fs.existsSync(path.join(rootDir, `lib/${TARGET_BROWSER}`)))
  fs.mkdirSync(path.join(rootDir, `lib/${TARGET_BROWSER}`));

// Generate manifest.json

manifest.description = 'Dev-tools for MobX and React';
manifest.version = rootPkg.version;
manifest.version_name = rootPkg.version + (NODE_ENV === 'development' ? '-dev' : '');

if (TARGET_BROWSER === 'chrome') {
  delete manifest.applications;
}

if (TARGET_BROWSER === 'firefox') {
  delete manifest.minimum_chrome_version;

  // Firefox MV3 uses background.scripts, not service_worker
  if (manifest.background && manifest.background.service_worker) {
    manifest.background = { scripts: [manifest.background.service_worker] };
  }

  // Firefox MV3 supports browser_specific_settings instead of applications
  // (applications still works but browser_specific_settings is preferred)

  // Firefox 128+ supports content_scripts world: "MAIN", so we keep it as-is
}

fs.writeFileSync(
  path.join(rootDir, `lib/${TARGET_BROWSER}/manifest.json`),
  JSON.stringify(manifest),
);
