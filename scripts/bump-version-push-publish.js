
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

  const { stdout, stderr } = exec([
    'git add .',
    `git commit -m '${commitMessage}'`,
    `git tag v${newVersion}`,
    // `git push ${remote}`,
    // `git push ${remote} v${newVersion}`,
    'npm publish',
  ].join((' && ')));
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
});

