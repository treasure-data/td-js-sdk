var test = require('tape-catch')
var noop = require('./noop')

test('noop', function (t) {
  t.plan(1)
  t.equal(noop(), undefined)
})
