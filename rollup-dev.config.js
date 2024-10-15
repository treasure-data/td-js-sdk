var commonjs = require('@rollup/plugin-commonjs')
var nodeResolver = require('@rollup/plugin-node-resolve')
var babel = require('@rollup/plugin-babel')
var sizes = require("rollup-plugin-sizes");

module.exports = {
  input: 'lib/index.js',
  output: {
    file: 'dist/td.js',
    format: 'iife'
  },
  plugins: [
    nodeResolver(),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    sizes({ details: true })
  ]
}
