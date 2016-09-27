var test = require('tape-catch')
var addQueryParams = require('../addQueryParams')

test('addQueryParams', function (t) {
  t.plan(3)

  t.equal(
    addQueryParams('/foo', { bar: 1 }),
    '/foo?bar=1',
    'url without query params'
  )

  t.equal(
    addQueryParams('/foo?bar=1', { baz: 2 }),
    '/foo?bar=1&baz=2',
    'url with query params'
  )

  t.equal(
    addQueryParams('/foo', { 'César': 'César' }),
    '/foo?C%C3%A9sar=C%C3%A9sar',
    'uri components are encoded'
  )
})
