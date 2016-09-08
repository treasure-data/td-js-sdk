var window = require('global/window')
var test = require('tape-catch')
var log = require('../log')

test('log', function (t) {
  if (!window.console) {
    return t.end()
  }

  t.plan(1)
  var originalConsoleLog = window.console.log
  try {
    window.console.log = function fakeConsoleLog () {
      window.console.log = originalConsoleLog
      t.deepEqual(Array.prototype.slice.call(arguments), ['[td]', 'text', false, []])
    }
    log('text', false, [])
  } finally {
    window.console.log = originalConsoleLog
  }
})
