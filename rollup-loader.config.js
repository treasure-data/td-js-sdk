var terser = require('@rollup/plugin-terser')

module.exports = {
  input: 'src/refined_loader.js',
  output: {
    file: 'dist/loader.min.js'
  },
  plugins: [terser()],
  context: 'this'
}
