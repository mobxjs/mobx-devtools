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
          test: /\.(eot|ttf|woff2?)$/,
          use: [{ loader: 'file-loader?name=fonts/[name].[ext]' }],
        },
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' }
          ]
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
