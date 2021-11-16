const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'web',
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'cheap-module-source-map' : 'hidden-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fallback: { stream: false },
  },
  entry: [path.join(__dirname, '/src/index.tsx')],
  output: {
    libraryTarget: 'umd',
    library: 'mobxDevtoolsFrontend',
    path: path.join(__dirname, '/lib'),
    filename: 'index.js',
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};
