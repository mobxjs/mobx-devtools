const webpack = require('webpack');
const path = require('path');

module.exports = [
  {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: path.join(__dirname, 'src/mobxDevtoolsBackend'),
    output: {
      library: {
        name: 'mobxDevtoolsBackend',
        type: 'umd',
      },
      path: path.join(__dirname, '/lib'),
      filename: 'mobxDevtoolsBackend.js',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext][query]',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
        __TARGET__: JSON.stringify('browser'),
      }),
    ],
    devtool: 'source-map',
    performance: {
      hints: false, // Disable performance hints
    },
  },
  {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: path.join(__dirname, '../../src/frontend'),
    output: {
      library: {
        type: 'commonjs2',
      },
      path: path.join(__dirname, '/lib'),
      filename: 'frontend.js',
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
                ['@babel/plugin-transform-class-properties'],
                '@babel/plugin-transform-runtime',
              ],
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext][query]',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts'],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __DEBUG_CONNECTION__: JSON.stringify(process.env.DEBUG_CONNECTION === 'true'),
        __TARGET__: JSON.stringify('browser'),
      }),
    ],
    devtool: 'source-map',
    performance: {
      hints: false, // Disable performance hints
    },
  },
];
