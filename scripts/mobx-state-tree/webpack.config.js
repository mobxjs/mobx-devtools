const webpack = require('webpack');
const path = require('path');

const rootDir = path.join(__dirname, '../../');

module.exports = {
  devtool: false,
  entry: path.join(rootDir, 'src/shells/mobx-state-tree/index.js'),
  output: {
    path: `${rootDir}/lib/mobx-state-tree`,
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-1'],
          plugins: ['transform-decorators-legacy', 'transform-class-properties']
        }
      },
    ]
  },
  externals: {
    'mobx-react': {
      root: 'mobxReact',
      commonjs: 'mobx-react',
      commonjs2: 'mobx-react',
      amd: 'mobx-react'
    },
    mobx: 'mobx'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __DEBUG_CONNECTION__: JSON.stringify(process.env['DEBUG_CONNECTION'] === 'true'),
      __TARGET__: JSON.stringify('browser')
    }),
  ]
};
