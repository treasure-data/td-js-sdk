var test = require('tape-catch')
var isArray = require('./isArray')

test('isArray', function (t) {
  t.plan(3)
  t.notOk(isArray({ length: 0 }))
  t.ok(isArray([]))
  t.ok(isArray(new Array())) // eslint-disable-line no-array-constructor
})
