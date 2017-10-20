'use strict';

const path = require('path');
const webpack = require('webpack');
const rootPath = path.join(__dirname, '..');

module.exports = {
  devtool: 'eval',
  entry: [
    process.env.PLAIN_DEVTOOL && path.join(rootPath, 'src/shells/plain'),
    path.join(__dirname, 'mobx-react-todomvc/src/client')
  ].filter(a => a),
  output: {
    path: path.join(rootPath, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'mobx-react-devtools': path.join(rootPath, 'src/shells/react-mini-panel'),
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
    port: 8082,
    contentBase: [
      path.join(__dirname, 'todomvc-public'),
      path.join(__dirname, 'mobx-react-todomvc')
    ],
    stats: {
      errorDetails: true,
      assets: false,
      chunks: false
    }
  }
};
