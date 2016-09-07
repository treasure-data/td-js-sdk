var test = require('tape-catch')
var isObject = require('./isObject')

test('isObject', function (t) {
  t.plan(5)
  t.notOk(isObject(null))
  t.ok(isObject(/regexp/))
  t.ok(isObject([]))
  t.ok(isObject(function () {}))
  t.ok(isObject({}))
})
