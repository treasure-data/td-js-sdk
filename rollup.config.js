import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify'
import buildtins from "rollup-plugin-node-builtins";

export default {
  input: './lib/index.js',
  output: {
    file: './dist/td.min.js',
    format: 'iife',
    name: 'Treasure',
    strict: false
  },
  plugins: [
    buildtins(),
    resolve({
      browser: true
    }),
    commonjs(),
    uglify({
      output: {
        quote_keys: true
      },
      ie8: false
    })
  ],
}