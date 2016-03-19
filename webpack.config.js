var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './lib/index',
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      // loader: 'react-hot!babel',
      loaders: ["babel-loader?" + JSON.stringify({
        plugins: ['transform-runtime'],
        presets: ['es2015', 'stage-0', 'react'],
      }), "eslint-loader"],
    }, {
      test: /\.json$/,
      exclude: /node_modules/,
      loader: 'json-loader',
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ]
};