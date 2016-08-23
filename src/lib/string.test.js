var test = require('tape-catch')
var string = require('./string')

test('string.isValidResourceName', function (t) {
  t.plan(2)
  t.equal(string.isValidResourceName('INVALID_RESOURCE'), false)
  t.equal(string.isValidResourceName('valid_resource_123'), true)
})

test('string.queryParamSeparator', function (t) {
  t.plan(2)
  t.equal(string.trim(' \t \r \n text \n \r \t '), 'text')
  t.equal(string.trim('text'), 'text')
})
