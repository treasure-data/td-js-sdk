var test = require('tape-catch')
var uri = require('./uri')

test('uri.addQueryParams', function (t) {
  t.plan(2)
  t.equal(
    uri.addQueryParams('/foo', { bar: true, baz: false }),
    '/foo?bar=true&baz=false'
  )
  t.equal(
    uri.addQueryParams('/foo?bar=true', { name: 'César' }),
    '/foo?bar=true&name=C%C3%A9sar'
  )
})

// test('uri.parseUrl', function (t) {
// })

test('uri.queryParamSeparator', function (t) {
  t.plan(2)
  t.equal(uri.queryParamSeparator('/foo'), '?')
  t.equal(uri.queryParamSeparator('/foo?bar=true'), '&')
})

test('uri.urlencode', function (t) {
  t.plan(4)
  t.equal(uri.urlencode({ 'César': 'César' }), 'C%C3%A9sar=C%C3%A9sar')
  t.equal(uri.urlencode({ foo: true, bar: false }), 'foo=true&bar=false')
  t.equal(uri.urlencode({ name: 'César' }), 'name=C%C3%A9sar')
  t.equal(uri.urlencode({}), '')
})
