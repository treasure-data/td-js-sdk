#!/usr/bin/env node

var cp = require('child_process')

function npm (command) {
  return cp.spawn('npm', ['run', command], { stdio: 'inherit' })
}

var unittests = process.env.CI ? 'test-ci' : 'test-local'
var e2etests = process.env.CI ? 'e2e-full' : 'e2e-local'

var unit = npm(unittests)

unit.on('close', function (code) {
  if (code === 0) {
    var e2e = npm(e2etests)
    e2e.on('close', function (code) {
      process.exit(code)
    })
  } else {
    process.exit(code)
  }
})
