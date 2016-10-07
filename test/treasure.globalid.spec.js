var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var GlobalID = require('../lib/plugins/globalid')
var cookie = require('cookies-js')

describe('Treasure GlobalID', function () {
  it('adds fetchGlobalID method', function () {
    var td = new Treasure({ writeKey: 'writeKey' })
    expect(typeof td.Treasure === 'function').ok()
  })

  describe('cacheSuccess', function () {
    it('should set cookie and return value', () => {
      expect(cookie.get('foo')).to.be.undefined()
      expect(GlobalID.cacheSuccess(42, 'foo')).to.be(42)
      expect(cookie.get('foo')).to.be(42)
    })
  })
})
