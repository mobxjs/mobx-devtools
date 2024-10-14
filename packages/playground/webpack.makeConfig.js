const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// WebpackDevServer no longer needs to be required manually as it is part of the devServer configuration
const crypto = require("crypto");

const rootPath = path.join(__dirname, '../..');

// Fix for MD4 deprecation
const crytpoOriginalCreateHash = crypto.createHash;
crypto.createHash = algorithm => crytpoOriginalCreateHash(algorithm === "md4" ? "sha256" : algorithm);

exports.makeConfig = ({
  pages = [
    'amsterdam',
    'baltimore',
    'baltimore-hooks',
    'casablanca',
    'denmark',
    'todo-6',
    'todo-local-6',
  ],
  plainDevtool = false,
}) => ({
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production', // Added 'mode'
  devtool: 'eval',
  entry: pages.reduce(
    (acc, entry) =>
      Object.assign(acc, {
        [entry]: [
          ...(plainDevtool ? [path.join(rootPath, 'src/shells/plain')] : []),
          path.join(__dirname, `src/${entry}`),
        ],
      }),
    {},
  ),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'mobx-state-tree': path.join(__dirname, 'node_modules/mobx-state-tree'),
      'mobx-devtools-mst': path.join(rootPath, 'packages/mobx-devtools-mst/src'),
      'mobx-devtools': path.join(rootPath, 'packages/mobx-devtools'),
      'mobx-react': path.join(__dirname, 'node_modules/mobx-react'),
      mobx: path.join(__dirname, 'node_modules/mobx'),
      aphrodite: 'aphrodite/no-important',
    },
  },
  externals: {
    'react-native': {
      root: 'ReactNative',
      commonjs: 'react-native',
      commonjs2: 'react-native',
      amd: 'react-native',
    },
  },
  module: {
    rules: [  // Changed 'loaders' to 'rules'
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              ['@babel/plugin-proposal-decorators', { 'legacy': true }],
              '@babel/plugin-transform-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.svg$/,
        use: 'url-loader',
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        use: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __TARGET__: JSON.stringify('browser'),
      __CLIENT__: JSON.stringify(true),
      __SERVER__: JSON.stringify(false),
      __DEV__: JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      title: 'Playground',
      links: pages,
      chunks: [],
      template: path.join(__dirname, 'page.html'),
    }),
    ...pages.map(
      entry =>
        new HtmlWebpackPlugin({
          title: entry,
          chunks: [entry],
          filename: `${entry}.html`,
          template: path.join(__dirname, 'page.html'),
        }),
    ),
  ],
  devServer: {
    port: 8082,
    contentBase: path.join(__dirname, 'static'),
    stats: {
      errorDetails: true,
      assets: false,
      chunks: false,
    },
    publicPath: '/', // Added to support serving files correctly in Webpack 4
  },
});

exports.startDevServer = options =>
  new Promise((resolve, reject) => {
    const webpackConfig = exports.makeConfig(options);
    const compiler = webpack(webpackConfig);
    const devServerOptions = {
      ...webpackConfig.devServer,
      publicPath: webpackConfig.output.publicPath,
    };
    const playDevServer = new webpack.DevServer(compiler, devServerOptions);

    playDevServer.listen(options.port, 'localhost', (err) => {
      if (err) reject(err);
    });

    compiler.hooks.done.tap('done', () => resolve(() => playDevServer.close()));  // Changed to use Webpack 4 hooks
    compiler.hooks.failed.tap('failed', reject);
  });
