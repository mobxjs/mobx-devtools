const path = require('path');
const webpack = require('webpack');

const rootPath = path.join(__dirname, '../..');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');

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
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ],
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
    static: path.join(__dirname, 'static'),
    devMiddleware: {
      stats: {
        errorDetails: true,
        assets: false,
        chunks: false,
      },
    }
  },
});

// exports.startDevServer = options =>
//   new Promise((resolve, reject) => {
//     const webpackConfig = exports.makeConfig(options);
//     const compiler = webpack(webpackConfig);
//     const playDevServer = new WebpackDevServer(compiler, {
//       ...webpackConfig.devServer,
//       publicPath: webpackConfig.output.publicPath,
//     });

//     playDevServer.listen(options.port);

//     // compiler.plugin('done', () => resolve(() => playDevServer.close()));
//     // compiler.plugin('failed', reject);
//   });
