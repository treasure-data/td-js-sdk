const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    td: './lib/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: process.env.MINIFY_BUILD ? 'production' : 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      )
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(lit-element|lit-html)\/).*/,
        loader: 'babel-loader'
      }
    ]
  }
}
