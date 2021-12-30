const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const rootDir = path.join(__dirname, '../../../');

module.exports = {
  devtool: false,
  entry: {
    backend: path.join(__dirname, 'backend.js'),
    background: path.join(__dirname, 'background.js'),
    injectGlobalHook: path.join(__dirname, 'injectGlobalHook.js'),
    contentScript: path.join(__dirname, 'contentScript.js'),
    panel: path.join(__dirname, 'panel.jsx'),
    'panel-loader': path.join(__dirname, 'panel-loader.js'),
    icons: path.join(__dirname, 'icons'),
  },
  output: {
    path: `${rootDir}/lib/${process.env.TARGET_BROWSER}`,
    filename: '[name].js',
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
          plugins: ['transform-decorators-legacy', 'transform-class-properties'],
        },
      },
      {
        test: /icons\/.*\.(png|svg)$/,
        loader: 'file-loader?name=icons/[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        query: {
          failOnWarning: false,
          failOnError: process.env.NODE_ENV !== 'development',
          fix: process.env.NODE_ENV === 'development',
          cache: false,
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|svg)$/,
        loader: 'url-loader',
        exclude: /icons\//,
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts'],
    alias: {
      'mobx-react': `${rootDir}/mobx-react/src`,
      mobx: `${rootDir}/mobx/src/mobx.ts`,
      aphrodite: 'aphrodite/no-important',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
      __TARGET__: JSON.stringify('browser'),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'html/window.html'),
      filename: 'window.html',
      chunks: ['window'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'html/panel-loader.html'),
      filename: 'panel-loader.html',
      chunks: ['panel-loader'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'html/panel.html'),
      filename: 'panel.html',
      chunks: ['panel'],
    }),
    new WriteFilePlugin(),
  ],
};
