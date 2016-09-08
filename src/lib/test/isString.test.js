var test = require('tape-catch')
var isString = require('../isString')

test('isString', function (t) {
  t.plan(2)
  t.notOk(isString(null))
  t.ok(isString(''))
})
