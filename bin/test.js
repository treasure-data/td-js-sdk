#!/usr/bin/env node

var cp = require('child_process')

// var runBrowserTests = process.env.CI &&
//   !process.env.TRAVIS_PULL_REQUEST ||
//   process.env.TRAVIS_PULL_REQUEST === 'false'

var script = process.env.CI ? 'test-ci' : 'test-local'
var node = cp.spawn('npm', ['run', script], { stdio: 'inherit' })
node.on('close', function (code) {
  process.exit(code)
})
