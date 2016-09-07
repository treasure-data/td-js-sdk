var test = require('tape-catch')
var uuid4 = require('./uuid4')

test('uuid4', function (t) {
  t.plan(3)
  var uuid = uuid4()
  t.equal(uuid.length, 32, 'size')
  t.equal(uuid.charAt(12), '4', 'version')
  t.ok(/(8|9|a|b)/.test(uuid.charAt(16)), 'variant')
})
