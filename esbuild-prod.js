#!/usr/bin/env node

require('esbuild').build({
  entryPoints: ['lib/index.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/td.min.js'
})
