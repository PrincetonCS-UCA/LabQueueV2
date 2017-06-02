const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public/');
var APP_DIR = path.resolve(__dirname, 'app/js');
var CSS_DIR = path.resolve(__dirname, 'app/scss');

var config = {
  entry: {
    'bundle': [APP_DIR + '/index.js', CSS_DIR + '/main.scss']
  },
  output: {
    path: BUILD_DIR,
    filename: 'js/[name].js'
  },
  module: {
    rules: [{
      test: /\.jsx?/,
      include: APP_DIR,
      use: 'babel-loader'
    }, {
      test: /\.scss$/,
      include: CSS_DIR,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader", // Will inject the style tag if plugin fails
        use: "css-loader!sass-loader",
      }),
    }, {
      test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
      loader: 'url-loader'
    }]
  },
  resolve: {
    extensions: ['.json', '.jsx', '.js', '.scss']
  },

  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      disable: false,
      allChunks: true
    })
  ]
};

module.exports = config;