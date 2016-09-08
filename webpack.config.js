const path = require('path')
const webpack = require('webpack')
const ClosureCompiler = require('google-closure-compiler-js').webpack

module.exports = function webpackConfig ({ build = false }) {
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

  if (build) {
    config.plugins.push(
      new ClosureCompiler({
        options: {
          languageIn: 'ECMASCRIPT5',
          languageOut: 'ECMASCRIPT3',
          compilationLevel: 'ADVANCED',
          warningLevel: 'VERBOSE'
        }
      })
    )
  }

  return config
}
