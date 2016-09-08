var test = require('tape-catch')
var identity = require('../identity')

test('identity', function (t) {
  t.plan(2)
  t.equal(identity(), undefined)
  t.equal(identity('foo'), 'foo')
})
