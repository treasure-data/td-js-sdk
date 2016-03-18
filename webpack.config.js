const webpack = require('webpack')

module.exports = {
  entry: {
    td: './lib/index.js'
  },
  output: {
    filename: '[name].js',
    path: './dist'
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })
  ]
}
