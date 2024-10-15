var commonjs = require('@rollup/plugin-commonjs')
var nodeResolver = require('@rollup/plugin-node-resolve')
var terser = require('@rollup/plugin-terser')
var babel = require('@rollup/plugin-babel')

module.exports = {
  input: 'lib/index.js',
  output: {
    file: 'dist/td.min.js',
    format: 'iife'
  },
  plugins: [
    nodeResolver(),
    commonjs(),
    terser(),
    babel({ babelHelpers: 'bundled' })
  ]
}
