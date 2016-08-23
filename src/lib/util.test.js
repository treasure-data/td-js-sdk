var test = require('tape-catch')
var util = require('./util')

test('util.identity', function (t) {
  t.plan(1)
  t.equal(util.identity('foo'), 'foo')
})

test('util.noop', function (t) {
  t.plan(1)
  t.equal(util.noop(), undefined)
})

test('util.uuid4', function (t) {
  t.plan(3)
  var uuid = util.uuid4()
  t.equal(uuid.length, 32, 'size')
  t.equal(uuid.charAt(12), '4', 'version')
  t.ok(/(8|9|a|b)/.test(uuid.charAt(16)), 'variant')
})
