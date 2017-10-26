
const prompt = require('prompt');
const fs = require('fs');
const lernaJson = require('../lerna.json');

const [vMajor, vMinor, vPatch] = lernaJson.version.split('.');
const exec = require('child_process').exec;


prompt.get([
  {
    name: 'newVersion',
    description: `Current version: ${vMajor}.${vMinor}.${vPatch}.  New version`,
    type: 'string',
    pattern: /^\d+\.\d+\.\d$/,
    message: 'Must be in semver format',
    default: `${vMajor}.${vMinor}.${+vPatch + 1}`,
  },
  {
    name: 'commitMessage',
    description: 'Commit message',
    type: 'string',
    default: 'Bumped version',
    required: true,
  },
  {
    name: 'remote',
    description: 'GIT remote to push',
    type: 'string',
    default: 'origin',
    required: true,
  },
], (err, { newVersion, commitMessage, remote }) => {
  if (err) throw err;

  lernaJson.version = newVersion;

  fs.writeFileSync('./lerna.json', JSON.stringify(lernaJson, null, 4), 'utf8');

  const CHANGELOG = String(fs.readFileSync('./CHANGELOG.md'));
  const d = new Date();
  const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  if (/## \[Unreleased\]\n.+/.test(CHANGELOG)) {
    fs.writeFileSync('./CHANGELOG.md', CHANGELOG.replace(/## \[Unreleased\]/, `## [Unreleased]\n\n## [${newVersion}] - ${dateString}`));
    console.log('Updated CHANGELOG'); // eslint-disable-line no-console
  } else {
    console.log('Skipped updating CHANGELOG'); // eslint-disable-line no-console
  }

  const child = exec([
    './node_modules/.bin/lerna build',
    `./node_modules/.bin/lerna publish --skip-git --repo-version ${newVersion} --yes`,
    'git add .',
    `git commit -m '${commitMessage}'`,
    `git tag v${newVersion}`,
    `git push ${remote}`,
    `git push ${remote} v${newVersion}`,
  ].join((' && ')));
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('close', process.exit);
});
