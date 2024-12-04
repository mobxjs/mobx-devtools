const fs = require('fs');
const lernaJson = require('../lerna.json');
const mobxDevtools = require('../packages/mobx-devtools/package.json');
const mobxDevtoolsMst = require('../packages/mobx-devtools-mst/package.json');
const playground = require('../packages/playground/package.json');

const [vMajor, vMinor, vPatch] = lernaJson.version.split('.');

const newVersion = `${vMajor}.${vMinor}.${+vPatch + 1}`;

lernaJson.version = newVersion;

fs.writeFileSync('./lerna.json', JSON.stringify(lernaJson, null, 4), 'utf8');

[
  [mobxDevtools, './packages/mobx-devtools/package.json'],
  [mobxDevtoolsMst, './packages/mobx-devtools-mst/package.json'],
  [playground, './packages/playground/package.json'],
].forEach(([pkg, path]) => {
  pkg.version = newVersion;
  fs.writeFileSync(path, JSON.stringify(pkg, null, 4), 'utf8');
});
