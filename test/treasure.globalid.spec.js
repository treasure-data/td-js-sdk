var expect = require('expect.js')
var global = require('global')
var Treasure = require('../lib/treasure')
var GlobalID = require('../lib/plugins/globalid')
var cookie = require('../lib/vendor/js-cookies')

describe('Treasure GlobalID', function () {
  it('adds fetchGlobalID method', function () {
    var td = new Treasure({ database: 'foo', writeKey: 'writeKey' })
    expect(typeof td.fetchGlobalID === 'function').ok()
  })

  describe('cacheSuccess', function () {
    beforeEach(function () {
      cookie.removeItem('foo')
    })
    it('should set cookie and return value', function () {
      expect(cookie.getItem('foo')).to.be(null)
      expect(GlobalID.cacheSuccess({ global_id: '42' }, 'foo')).to.be('42')
      expect(cookie.getItem('foo')).to.be('42')
    })
    it('should set localStorage and return value', function () {
      expect(GlobalID.cacheSuccess({ global_id: '42' }, 'foo', true)).to.be('42')
      expect(global.localStorage['foo']).to.be('42')
    })
  })
})
