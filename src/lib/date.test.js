var test = require('tape-catch')
var date = require('./date')

test('date.now', function (t) {
  t.plan(1)
  t.ok(typeof date.now() === 'number')
})
