#!/usr/bin/env node

var selenium = require('selenium-standalone')
var server = require('./server')
var path = require('path')
var glob = require('glob')
var wd = require('wd')

var tests = glob.sync(path.resolve(__dirname, '../test/e2e/*.spec.js'))
selenium.start(function (err, child) {
  if (err) {
    throw err
  }

  var count = tests.length
  function finish () {
    count -= 1
    if (!count) {
      if (child && child.kill) {
        child.kill()
      }
      process.exit(0)
    }
  }

  server.listen(9999, runTests)
  function runTests () {
    tests.forEach(function (file) {
      var test = require(file)
      test(wd.remote('http://localhost:4444/wd/hub'), { browserName: 'chrome' }, finish)
    })
  }
})
