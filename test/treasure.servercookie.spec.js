var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var cookie = require('../lib/vendor/js-cookies')
describe('Treasure Server Cookie', function () {
  describe('configure', function () {
    it('should support sscDomain as string', function () {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', sscDomain: 'foo', useServerSideCookie: true })
      expect(td.client.sscDomain).to.be('foo')
    })
    it('should support sscDomain as function', function () {
      var foo = function () { return 'foo' }
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true, sscDomain: foo })
      expect(td.client.sscDomain()).to.be('foo')
    })

    it('should support sscServer as function', function (done) {
      var foo = function () { return 'foo' }
      var sscServerFunction = function (host) {
        return ['ssc', host].join('.')
      }
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true, sscDomain: foo, sscServer: sscServerFunction, startInSignedMode: true })
      td.client._protocol = 'https:'
      td.client._hostname = 'foo'

      expect(td.client.sscDomain()).to.be('foo')

      cookie.setItem('_td_ssc_id', 'foo')
      td.fetchServerCookie(function (val) {
        expect(td._serverCookieDomain).to.be('foo')
        expect(td._serverCookieDomainHost).to.be('ssc.foo')
        done()
      })
    })
  })
  it('adds fetchServerCookie method', function () {
    var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
    expect(typeof td.fetchServerCookie === 'function').ok()
  })

  describe('cookie ', function () {
    beforeEach(function () {
      cookie.setItem('_td_ssc_id', 'foo')
    })
    it('should return td_ssc_id from cookie if available', function (done) {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true, sscDomain: 'foo', startInSignedMode: true })
      td.client._protocol = 'https:'
      td.client._hostname = 'foo'
      td.fetchServerCookie(function (val) {
        expect(val).to.be('foo')

        expect(td._serverCookieDomain).to.be('foo')
        expect(td._serverCookieDomainHost).to.be('ssc.foo')
        done()
      })
    })

    it('should throw error', function () {
      var td = new Treasure({ database: 'foo', writeKey: 'writeKey', useServerSideCookie: true, sscDomain: 'foo', startInSignedMode: true })
      td.client._protocol = 'http:'
      td.client._hostname = 'local'
      expect(td.fetchServerCookie).to.throwError()
    })
  })
})
