'use strict';

const path = require('path');
const webpack = require('webpack');
const rootPath = path.join(__dirname, '..');

module.exports = {
  devtool: 'eval',
  entry: path.join(__dirname, 'mobx-react-todomvc/src/client'),
  output: {
    path: path.join(rootPath, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'mobx-react-devtools': path.join(rootPath, 'src/shells/react'),
      'mobx-devtools': path.join(rootPath, 'src'),
      'mobx-react': path.join(__dirname, 'mobx-react/src'),
      mobx: path.join(__dirname, 'mobx/src/mobx.ts')
    }
  },
  externals: {
    'react-native': {
      root: 'ReactNative',
      commonjs: 'react-native',
      commonjs2: 'react-native',
      amd: 'react-native'
    }
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
      __SERVER__: JSON.stringify(false)
    })
  ],
  devServer: {
    port: 8081,
    contentBase: [
      path.join(__dirname, 'mobx-react-todomvc'),
      path.join(__dirname, 'playground/todomvc-public')
    ],
    stats: {
      errorDetails: true,
      assets: false,
      chunks: false
    }
  }
};
