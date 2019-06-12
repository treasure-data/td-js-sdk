var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var ServerCookie = require('../lib/plugins/servercookie')
var cookie = require('../lib/vendor/js-cookies')

describe('Treasure Server Cookie', function () {
  describe('configure', () => {
    it('should support cookieDomain as string', () => {})
    it('should support cookieDomain as function', () => {})
    it('should create cookieDomainHost based on cookieDomain, as default', () => {})
  })
  it('adds fetchServerCookie method', function () {
    var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
    expect(typeof td.fetchServerCookie === 'function').ok()
  })

  describe('cacheSuccess', function () {
    beforeEach(function () {
      cookie.removeItem('foo')
    })
    it('should set cookie and return value', function () {
      expect(cookie.getItem('foo')).to.be(null)
      expect(ServerCookie.cacheSuccess({ td_ssc_id: '42' }, 'foo')).to.be('42')
      expect(cookie.getItem('foo')).to.be('42')
    })
  })
})
