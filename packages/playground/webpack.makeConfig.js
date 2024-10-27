const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const rootPath = path.join(__dirname, '../..');

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
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
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
    publicPath: '/',
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
    fallback: {
      path: require.resolve('path-browserify'),
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
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
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
    new NodePolyfillPlugin(),
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
    host: 'localhost',
    port: 8082,
    static: {
      directory: path.join(__dirname, 'static'),
    },
    devMiddleware: {
      publicPath: '/',
    },
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});

exports.startDevServer = options =>
  new Promise((resolve, reject) => {
    const webpackConfig = exports.makeConfig(options);
    const compiler = webpack(webpackConfig);

    // Set host and port if not already set
    webpackConfig.devServer.host = webpackConfig.devServer.host || 'localhost';
    webpackConfig.devServer.port = webpackConfig.devServer.port || options.port || 8082;

    const server = new WebpackDevServer(webpackConfig.devServer, compiler);

    server
      .start()
      .then(() => {
        console.log(
          `Dev server is running on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}`,
        );
        resolve(() => server.stop());
      })
      .catch(err => {
        console.error('Failed to start server:', err);
        reject(err);
      });

    compiler.hooks.done.tap('done', () => {
      console.log('Compilation completed.');
    });

    compiler.hooks.failed.tap('failed', error => {
      console.error('Compilation failed:', error);
      reject(error);
    });
  });
