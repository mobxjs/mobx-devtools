const { exec } = require('child_process');
const lernaJson = require('../lerna.json');

const child = exec(
  `./node_modules/.bin/lerna publish --skip-git --repo-version ${lernaJson.version} --yes`,
);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('close', process.exit);
