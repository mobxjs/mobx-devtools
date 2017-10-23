
const prompt = require('prompt');
const fs = require('fs');
const pkg = require('../package.json');

const [vMajor, vMinor, vPatch] = pkg.version.split('.');
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

  pkg.version = newVersion;

  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 4), 'utf8');

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
    'git add .',
    `git commit -m '${commitMessage}'`,
    `git tag v${newVersion}`,
    `git push ${remote}`,
    `git push ${remote} v${newVersion}`,
    'npm publish',
  ].join((' && ')));
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('close', process.exit);
});

