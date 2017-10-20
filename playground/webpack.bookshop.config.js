'use strict';

const path = require('path');
const webpack = require('webpack');
const rootPath = path.join(__dirname, '..');

module.exports = {
  devtool: 'eval',
  entry: ['babel-polyfill', path.join(__dirname, 'mobx-state-tree/examples/bookshop/src')],
  output: {
    path: path.join(rootPath, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [
      'node_modules',
      path.join(__dirname, 'mobx-state-tree/node_modules'),
      path.join(__dirname, 'mobx-state-tree/examples/bookshop/node_modules')
    ],
    alias: {
      'mobx-state-tree': path.join(__dirname, 'mobx-state-tree/src'),
      'mobx': path.join(__dirname, 'mobx-state-tree/node_modules/mobx'), // prevent duplication mobx instances
      'mobx-devtools': path.join(rootPath, 'src/shells'),
    }
  },
  resolveLoader: {
    modules: [
      path.join(rootPath, 'node_modules'),
      path.join(__dirname, 'mobx-state-tree/node_modules'),
      path.join(__dirname, 'mobx-state-tree/examples/bookshop/node_modules')
    ]
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
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
      __CLIENT__: JSON.stringify(true),
      __SERVER__: JSON.stringify(false),
    })
  ],
  devServer: {
    port: 8080,
    contentBase: path.join(__dirname, 'bookshop-public'),
    stats: {
      errorDetails: true,
      assets: false,
      chunks: false
    }
  }
};
