'use strict';

var path = require('path');
var webpack = require('webpack');

var ENV = process.env.NODE_ENV || 'development';
var FILENAME = 'rob-api-sdk';
var isProduction = (ENV === 'production');

var plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(ENV)
    }
  })
];

// extend plugins list for production
if (isProduction) {
  plugins = plugins.concat([
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: { comments: false }
    }),
    new webpack.NoErrorsPlugin()
  ]);
}

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.join(__dirname, '/dist/'),
    filename: isProduction ? `${FILENAME}.min.js` : `${FILENAME}.js`,
    library: 'robApiSDK',
    libraryTarget: 'umd'
  },

  resolve: {
    extensions: ['', '.js', '.json']
  },

  plugins: plugins,

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: ['babel']
    }]
  }
};
