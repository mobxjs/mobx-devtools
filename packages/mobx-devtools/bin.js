#!/usr/bin/env node
// eslint-disable-next-line import/no-unresolved
const electron = require('electron');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);

const result = spawnSync(electron, [require.resolve('./app')].concat(argv), { stdio: 'ignore' });
process.exit(result.status);
