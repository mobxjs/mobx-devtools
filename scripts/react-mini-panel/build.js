const webpack = require('webpack');
const path = require('path');
const config = require('../../src/shells/react-mini-panel/webpack.config');
const fs = require('fs');

const rootDir = path.join(__dirname, '../../');

webpack(config, (err) => {
  if (err) throw err;
  const tsSrcPath = path.join(rootDir, 'src/shells/react-mini-panel/index.d.ts');
  const tsTargetPath = path.join(rootDir, 'lib/react-mini-panel/index.d.ts');
  fs.createReadStream(tsSrcPath).pipe(fs.createWriteStream(tsTargetPath));
});

