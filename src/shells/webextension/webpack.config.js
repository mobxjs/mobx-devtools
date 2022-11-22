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
    window: path.join(__dirname, 'window.jsx'),
    icons: path.join(__dirname, 'icons'),
  },
  output: {
    path: `${rootDir}/lib/${process.env.TARGET_BROWSER}`,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [{ 
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }],
        exclude: /node_modules/
      },
      {
        test: /icons\/.*\.(png|svg)$/,
        use: 'file-loader?name=icons/[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: [{ 
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }],
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.(png|svg)$/,
        use: 'url-loader',
        exclude: /icons\//,
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        use: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ],
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
