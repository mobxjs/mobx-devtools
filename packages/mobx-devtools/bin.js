#!/usr/bin/env node
const electron = require('electron');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);

const result = spawnSync(
  electron,
  [require.resolve('./app')].concat(argv),
  { stdio: 'ignore' }
);
process.exit(result.status);
