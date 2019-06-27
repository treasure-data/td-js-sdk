var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var cookie = require('../lib/vendor/js-cookies')

describe('Treasure Server Cookie', function () {
  describe('configure', () => {
    it('should support cookieDomain as string', function () {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', cookieDomain: 'foo' })
      expect(td.client.cookieDomain).to.be('foo')
    })
    it('should support cookieDomain as function', function () {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', cookieDomain: () => 'foo' })
      expect(td.client.cookieDomain).to.be('foo')
    })
    it('should create cookieDomainHost based on cookieDomain, as default', () => {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
      expect(td.client.cookieDomainHost).to.be('ssc.localhost')
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
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
      td.fetchServerCookie(function (val) {
        expect(val).to.be('foo')
        done()
      })
    })
  })
})
