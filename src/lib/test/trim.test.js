var test = require('tape-catch')
var trim = require('../trim')

test('trim', function (t) {
  t.plan(3)
  t.equal(trim(' \t \r \n text \n \r \t '), 'text')
  t.equal(trim('text'), 'text')
  t.equal(trim(null), '')
})
