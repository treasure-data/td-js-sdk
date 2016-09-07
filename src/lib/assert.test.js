var test = require('tape-catch')
var assert = require('./assert')

test('assert', function (t) {
  t.plan(2)

  t.throws(function () {
    assert(false, 'assertion message')
  }, /assertion message/)

  t.doesNotThrow(function () {
    assert(true, 'assertion message')
  })
})
