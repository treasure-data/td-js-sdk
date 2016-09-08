var test = require('tape-catch')
var assign = require('../assign')

test('assign', function (t) {
  t.plan(2)

  t.deepEqual(
    assign({ a: 1 }, undefined, { b: 2 }, null, { c: 3 }),
    { a: 1, b: 2, c: 3 }
  )

  t.throws(function () {
    assign(undefined)
  }, /TypeError/)
})
