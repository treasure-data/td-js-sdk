const path = require('path')
const webpack = require('webpack')

module.exports = function webpackConfig ({ build = false } = {}) {
  const config = {
    entry: {
      td: './src/script.js'
    },
    output: {
      filename: build ? '[name].min.js' : '[name].js',
      path: path.join(__dirname, 'dist')
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': `'${build ? 'development' : 'production'}'`
      })
    ]
  }

  return config
}
