#!/usr/bin/env node

require('esbuild').build({
  entryPoints: ['lib/index.js'],
  bundle: true,
  outfile: 'dist/td.js'
})
