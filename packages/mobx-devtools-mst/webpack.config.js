const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: false,
  entry: path.join(__dirname, 'src'),
  output: {
    library: {
      name: 'mobxDevtoolsMST',
      type: 'umd',
    },
    path: path.join(__dirname, '/lib'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              '@babel/plugin-transform-class-properties',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    'mobx-state-tree': {
      root: 'mobxStateTree',
      commonjs: 'mobx-state-tree',
      commonjs2: 'mobx-state-tree',
      amd: 'mobx-state-tree',
    },
    mobx: 'mobx',
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
      __TARGET__: JSON.stringify('browser'),
    }),
    // UglifyJsPlugin is no longer needed; optimization in production mode is handled by webpack 5
  ],
  performance: {
    hints: false, // Disable performance hints
  },
};
