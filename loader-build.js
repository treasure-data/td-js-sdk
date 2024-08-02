#!/usr/bin/env node

require('esbuild').build({
  entryPoints: ['src/loader.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/loader.min.js'
})
