const webpack = require('webpack');
const path = require('path');

const rootDir = path.join(__dirname, '../../../');

module.exports = {
  entry: __dirname,
  output: {
    libraryTarget: 'umd',
    library: 'mobxDevtools',
    path: path.join(rootDir, 'lib'),
    filename: 'react-mini-panel/index.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader',
      },
      {
        test: /\.css$/,
        loader: 'css-loader/locals',
        options: {
          modules: true,
        },
      },
      {
        test: /\.svg$/,
        loader: 'url-loader',
      },
    ],
  },
  externals: {
    'mobx-react': {
      root: 'mobxReact',
      commonjs: 'mobx-react',
      commonjs2: 'mobx-react',
      amd: 'mobx-react',
    },
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
    mobx: 'mobx',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      screw_ie8: true,
      compress: {
        warnings: false,
      },
    }),
  ],
};
