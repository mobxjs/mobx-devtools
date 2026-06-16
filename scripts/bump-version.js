const fs = require('fs');
const rootPkg = require('../package.json');
const mobxDevtools = require('../packages/mobx-devtools/package.json');
const mobxDevtoolsMst = require('../packages/mobx-devtools-mst/package.json');
const playground = require('../packages/playground/package.json');

const [vMajor, vMinor, vPatch] = rootPkg.version.split('.');

const newVersion = `${vMajor}.${vMinor}.${+vPatch + 1}`;

rootPkg.version = newVersion;

fs.writeFileSync('./package.json', JSON.stringify(rootPkg, null, 2), 'utf8');

[
  [mobxDevtools, './packages/mobx-devtools/package.json'],
  [mobxDevtoolsMst, './packages/mobx-devtools-mst/package.json'],
  [playground, './packages/playground/package.json'],
].forEach(([pkg, path]) => {
  pkg.version = newVersion;
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2), 'utf8');
});
