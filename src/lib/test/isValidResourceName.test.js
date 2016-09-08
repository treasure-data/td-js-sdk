var test = require('tape-catch')
var isValidResourceName = require('../isValidResourceName')

test('isValidResourceName', function (t) {
  t.plan(3)
  t.equal(isValidResourceName(undefined), false)
  t.equal(isValidResourceName('INVALID_RESOURCE'), false)
  t.equal(isValidResourceName('valid_resource_123'), true)
})
