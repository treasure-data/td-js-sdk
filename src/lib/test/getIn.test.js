var test = require('tape-catch')
var getIn = require('../getIn')

test('getIn', function (t) {
  t.plan(6)
  t.equal(getIn(null, 'key', 10), 10)
  t.equal(getIn({}, '', 20), 20)
  t.equal(getIn({ key: true }, 'key', false), true)
  t.equal(getIn({ key: true }, 'wrong', false), false)
  t.equal(getIn({ a: { b: 10 } }, 'a.b', 20), 10)
  t.equal(getIn({ a: { b: 10 } }, 'b.a', 20), 20)
})
