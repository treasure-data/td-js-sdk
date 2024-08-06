var commonjs = require('@rollup/plugin-commonjs')
var nodeResolver = require('@rollup/plugin-node-resolve')

module.exports = {
  input: 'lib/index.js',
  output: {
    file: 'dist/td.js',
    format: 'iife'
  },
  plugins: [nodeResolver(), commonjs()]
}
