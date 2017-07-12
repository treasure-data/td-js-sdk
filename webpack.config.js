const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

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
    }),
    process.env.MINIFY_BUILD
      ? new UglifyJSPlugin({
        compress: {
          screw_ie8: false
        },
        mangle: {
          screw_ie8: false
        },
        output: {
          screw_ie8: false,
          quote_keys: true
        }
      })
      : new UglifyJSPlugin({
        compress: false,
        mangle: false,
        beautify: true,
        output: {
          quote_keys: true
        }
      })
  ]
}
