const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const rootDir = path.join(__dirname, '../../');
const shellDir = path.join(rootDir, 'src/shells/webextension');

module.exports = {
  devtool: false,
  entry: {
    backend: path.join(shellDir, 'backend.js'),
    background: path.join(shellDir, 'background.js'),
    injectGlobalHook: path.join(shellDir, 'injectGlobalHook.js'),
    contentScript: path.join(shellDir, 'contentScript.js'),
    panel: path.join(shellDir, 'panel.jsx'),
    'panel-loader': path.join(shellDir, 'panel-loader.js'),
    window: path.join(shellDir, 'window.jsx'),
    icons: path.join(shellDir, 'icons')
  },
  output: {
    path: `${rootDir}/lib/${process.env.TARGET_BROWSER}`,
    filename: '[name].js'
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
        test: /icons\/.*\.(png|svg)$/,
        loader: 'file-loader?name=icons/[name].[ext]',
        exclude: /node_modules/
      },
      // {
      //     test: /\.jsx?$/,
      //     exclude: /node_modules/,
      //     loader: 'eslint-loader',
      //     query: {
      //         failOnWarning: false,
      //         failOnError: process.env.NODE_ENV !== 'development',
      //         fix: process.env.NODE_ENV === 'development',
      //         cache: false
      //     }
      // },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.(png|svg)$/,
        loader: 'url-loader',
        exclude: /icons\//
      },
      {
        test: /\.css$/,
        loader: 'style-loader!style-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts'],
    alias: {
      'mobx-react': rootDir + '/mobx-react/src',
      mobx: rootDir + '/mobx/src/mobx.ts'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __DEBUG_CONNECTION__: JSON.stringify(process.env['DEBUG_CONNECTION'] === 'true'),
      __TARGET__: JSON.stringify('browser')
    }),
    new HtmlWebpackPlugin({
      template: path.join(rootDir, '/src/shells/webextension/html/window.html'),
      filename: 'window.html',
      chunks: ['window']
    }),
    new HtmlWebpackPlugin({
      template: path.join(rootDir, '/src/shells/webextension/html/panel-loader.html'),
      filename: 'panel-loader.html',
      chunks: ['panel-loader']
    }),
    new HtmlWebpackPlugin({
      template: path.join(rootDir, '/src/shells/webextension/html/panel.html'),
      filename: 'panel.html',
      chunks: ['panel']
    }),
    new WriteFilePlugin()
  ]
};
