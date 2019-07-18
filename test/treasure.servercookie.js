var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var cookie = require('../lib/vendor/js-cookies')

describe('Treasure Server Cookie', function () {
  describe('configure', function () {
    it('should support cookieDomain as string', function () {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', sscDomain: 'foo', useServerSideCookie: true })
      expect(td.client.cookieDomain).to.be('foo')
    })
    it('should support cookieDomain as function', function () {
      var foo = function () { return 'foo' }
      var cookieDomainHost = function (host) { return ['ssc', foo] }
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true, sscDomain: foo, sscServer: cookieDomainHost })
      expect(td.client.sscDomain).to.be(foo)
      // we need to set cookie to prevent the real jsonp going out
      cookie.setItem('td_ssc_id', 'foo')
      expect(td._serverCookieDomain).to.be('foo')
      expect(td._serverCookieDomainHost).to.be('ssc.foo')
    })
  })
  it('adds fetchServerCookie method', function () {
    var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
    expect(typeof td.fetchServerCookie === 'function').ok()
  })

  describe('cookie ', function () {
    beforeEach(function () {
      cookie.setItem('td_ssc_id', 'foo')
    })
    it('should return td_ssc_id from cookie if available', function (done) {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true })
      td.fetchServerCookie(function (val) {
        expect(val).to.be('foo')
        done()
      })
    })
  })
})
