const del = require('del');
const fs = require('fs');
const webpack = require('webpack');
const config = require('./webpack.config');

del.sync('./lib/mobx-state-tree');
if (!fs.existsSync('./lib/')) fs.mkdirSync('./lib/');
if (!fs.existsSync('./lib/mobx-state-tree')) fs.mkdirSync('./lib/mobx-state-tree');

webpack(config, err => {
  if (err) throw err;
});




