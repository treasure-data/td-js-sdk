var test = require('tape-catch')
var now = require('../now')

test('now', function (t) {
  t.plan(1)
  t.ok(typeof now() === 'number')
})
