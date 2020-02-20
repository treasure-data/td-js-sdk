import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import buildtins from 'rollup-plugin-node-builtins'
import progress from 'rollup-plugin-progress'

var options = {
  format: 'iife',
  name: 'Treasure',
  strict: false
}

export default {
  input: './lib/index.js',
  output: [
    {
      file: './dist/td.js',
      ...options,
      plugins: [
        uglify({
          compress: false,
          mangle: false,

          output: {
            beautify: true,
            quote_keys: true
          }
        })
      ]
    },
    {
      file: './dist/td.min.js',
      ...options,
      plugins: [
        uglify({
          output: {
            quote_keys: true
          },
          ie8: false
        })
      ]
    }
  ],

  plugins: [
    progress({
      clearLine: false
    }),
    buildtins(),
    resolve({
      browser: true
    }),
    commonjs()
  ]
}
