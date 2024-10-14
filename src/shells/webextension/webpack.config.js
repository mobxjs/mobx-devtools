const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// WriteFilePlugin is no longer needed in Webpack 4+
const rootDir = path.join(__dirname, '../../../');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',  // Added 'mode'
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
    rules: [  // Changed 'loaders' to 'rules'
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /icons\/.*\.(png|svg)$/,
        use: 'file-loader?name=icons/[name].[ext]',
        exclude: /node_modules/,
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            failOnWarning: false,
            failOnError: process.env.NODE_ENV !== 'development',
            fix: process.env.NODE_ENV === 'development',
            cache: false,
          },
        },
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
    // WriteFilePlugin is no longer needed as Webpack 4 handles this internally
  ],
};
