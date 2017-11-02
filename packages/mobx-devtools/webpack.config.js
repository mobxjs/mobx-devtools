const webpack = require('webpack');
const path = require('path');

module.exports = [
  {
    devtool: false,
    entry: path.join(__dirname, 'src/mobxDevtoolsBackend'),
    output: {
      libraryTarget: 'umd',
      library: 'mobxDevtoolsBackend',
      path: path.join(__dirname, '/lib'),
      filename: 'mobxDevtoolsBackend.js',
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: { cacheDirectory: true },
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
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
        __TARGET__: JSON.stringify('browser'),
      }),
    ],
  },
  {
    devtool: false,
    entry: path.join(__dirname, '../../src/frontend'),
    output: {
      libraryTarget: 'commonjs2',
      path: path.join(__dirname, '/lib'),
      filename: 'frontend.js',
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: { cacheDirectory: true },
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
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
        __TARGET__: JSON.stringify('browser'),
      }),
    ],
  },
];
