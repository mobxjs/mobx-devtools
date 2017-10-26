'use strict';

const path = require('path');
const webpack = require('webpack');
const rootPath = path.join(__dirname, '..');

module.exports = {
  devtool: 'eval',
  entry: [
    'babel-polyfill',
    process.env.PLAIN_DEVTOOL && path.join(rootPath, 'src/shells/plain'),
    path.join(__dirname, 'mobx-state-tree/packages/mst-example-bookshop/src')
  ],
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
    ],
    alias: {
      'mobx-state-tree': path.join(__dirname, 'mobx-state-tree/packages/mobx-state-tree/src'),
      'mobx': path.join(__dirname, 'mobx-state-tree/packages/mobx-state-tree/node_modules/mobx'), // prevent duplication mobx instances
      'mobx-devtools-mst': path.join(rootPath, 'packages/mobx-devtools-mst/src'),
      aphrodite: 'aphrodite/no-important',
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
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        query: {
          emitWarning: process.env.NODE_ENV === 'development',
          failOnWarning: false,
          failOnError: process.env.NODE_ENV !== 'development',
          fix: process.env.NODE_ENV === 'development',
          cache: false,
        },
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
      __CLIENT__: JSON.stringify(true),
      __SERVER__: JSON.stringify(false),
      __DEV__: JSON.stringify(true),
    })
  ],
  devServer: {
    port: 8080,
    contentBase: path.join(__dirname, 'bookshop-public'),
    historyApiFallback: true,
    stats: {
      errorDetails: true,
      assets: false,
      chunks: false
    }
  }
};
