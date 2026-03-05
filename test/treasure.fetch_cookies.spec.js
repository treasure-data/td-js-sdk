var expect = require('chai').expect
var cookies = require('../lib/vendor/js-cookies')
var Treasure = require('../lib/treasure')

var cookieA = '_vendor_a'
var cookieB = '_vendor_b'
var cookieC = '_vendor_c'

function setMetaCookies() {
  cookies.setItem('_fbp', 'fbp', 5)
  cookies.setItem('_fbc', 'fbc', 5)
}

function setGoogleMPCookies() {
  cookies.setItem('_gcl_a', 'a', 5)
  cookies.setItem('_gcl_b', 'b', 5)
  cookies.setItem('_gcl_c', 'c', 5)
}

function setGoogleMPCookies2() {
  cookies.setItem('_gcl2_a', 'a', 5)
  cookies.setItem('_gcl2_b', 'b', 5)
  cookies.setItem('_gcl2_c', 'c', 5)
}

function setGoogleAnalyticsCookie() {
  cookies.setItem('_ga', 'ga', 5)
}

function setInstagramCookies() {
  cookies.setItem('shbts', 'shbts', 5)
  cookies.setItem('shbid', 'shbid', 5)
  cookies.setItem('ds_user_id', 'anuid', 5)
}

function setYahooJapanMeasurementCookies() {
  cookies.setItem('_ly_c', 'ly_c_value', 5)
  cookies.setItem('_ly_r', 'ly_r_value', 5)
  cookies.setItem('_ly_su', 'ly_su_value', 5)
}

function setYahooJapanLegacyCookies() {
  cookies.setItem('_ycl_yjad', 'ycl_value', 5)
  cookies.setItem('_yjr_yjad', 'yjr_value', 5)
  cookies.setItem('_yjsu_yjad', 'yjsu_value', 5)
}

function setTestCookies() {
  cookies.setItem(cookieA, 'a', 5)
  cookies.setItem(cookieB, 'b', 5)
  cookies.setItem(cookieC, 'c', 5)
}

describe('Fetch cookies and params', function () {
  var treasure
  var configs = {
    database: 'database',
    writeKey: 'writeKey',
    development: true,
    logging: false,
    startInSignedMode: true
  }

  describe('#collectTags by vendor names', function () {
    beforeEach(function () {
      treasure = new Treasure(configs)
    })
    it('should collect tags for vendors', function () {
      // Meta
      setMetaCookies()

      // Google Marketing Platform
      setGoogleMPCookies()

      treasure.collectTags({
        vendors: ['meta', 'google_mp']
      })

      var globalTable = treasure.get('$global')
      expect(globalTable['_fbp']).to.equal('fbp')
      expect(globalTable['_fbc']).to.equal('fbc')
      expect(globalTable['_gcl_a']).to.equal('a')
      expect(globalTable['_gcl_b']).to.equal('b')
      expect(globalTable['_gcl_c']).to.equal('c')
    })

    it('should collect tags with custom prefix', function () {
      // Google Marketing Platform
      setGoogleMPCookies2()

      treasure.collectTags(
        {
          vendors: ['google_mp']
        },
        { gclPrefix: '_gcl2' }
      )

      var globalTable = treasure.get('$global')
      expect(globalTable['_gcl2_a']).to.equal('a')
      expect(globalTable['_gcl2_b']).to.equal('b')
      expect(globalTable['_gcl2_c']).to.equal('c')
    })
    it('should include empty values for unset tags', function () {
      setMetaCookies()

      treasure.collectTags({
        vendors: ['meta', 'google_ga', 'google_ads']
      })

      var globalTable = treasure.get('$global')
      expect(globalTable['_fbp']).to.equal('fbp')
      expect(globalTable['_fbc']).to.equal('fbc')
      expect(globalTable['_ga']).to.be.null
      expect(globalTable['gclid']).to.be.null
      expect(globalTable['wbraid']).to.be.null
    })
  })

  describe('#collectTags by cookie names', function () {
    beforeEach(function () {
      treasure = new Treasure(configs)
    })

    it('should collect values for cookies', function () {
      setTestCookies()
      treasure.collectTags({
        cookies: [cookieA, cookieB, cookieC, '_unknown_cookie']
      })

      var globalTable = treasure.get('$global')

      expect(globalTable[cookieA]).to.equal('a')
      expect(globalTable[cookieB]).to.equal('b')
      expect(globalTable[cookieC]).to.equal('c')
      expect(globalTable['_unknown_cookie']).to.be.null
    })
  })

  describe('#collectTags by vendors and cookies', function () {
    beforeEach(function () {
      treasure = new Treasure(configs)
    })

    it('should collect correct tags', function () {
      var unknowCookie = '_unknow_cookie'

      setMetaCookies()
      setGoogleMPCookies()
      setTestCookies()

      treasure.collectTags({
        vendors: ['meta', 'google_mp'],
        cookies: [cookieA, cookieB, unknowCookie]
      })

      var globalTable = treasure.get('$global')

      expect(globalTable['_fbp']).to.equal('fbp')
      expect(globalTable['_fbc']).to.equal('fbc')
      expect(globalTable['_gcl_a']).to.equal('a')
      expect(globalTable['_gcl_b']).to.equal('b')
      expect(globalTable['_gcl_c']).to.equal('c')
      expect(globalTable[cookieA]).to.equal('a')
      expect(globalTable[cookieB]).to.equal('b')
      expect(globalTable[unknowCookie]).to.be.null
    })
  })

  describe('collect all tags', function () {
    beforeEach(function () {
      treasure = new Treasure(configs)
    })

    it('should collect all non-empty tags', function () {
      setMetaCookies()
      setGoogleMPCookies()
      setGoogleAnalyticsCookie()
      setInstagramCookies()

      treasure.collectTags()

      var globalTable = treasure.get('$global')

      expect(globalTable['_fbp']).to.equal('fbp')
      expect(globalTable['_fbc']).to.equal('fbc')
      expect(globalTable['_gcl_a']).to.equal('a')
      expect(globalTable['_gcl_b']).to.equal('b')
      expect(globalTable['_gcl_c']).to.equal('c')
      expect(globalTable['_ga']).to.equal('ga')
      expect(globalTable['shbts']).to.equal('shbts')
      expect(globalTable['shbid']).to.equal('shbid')
      expect(globalTable['ds_user_id']).to.equal('anuid')
    })
  })

  describe('#collectTags Yahoo Japan measurement tags', function () {
    beforeEach(function () {
      treasure = new Treasure(configs)
    })

    it('should collect _ly_c, _ly_r, _ly_su cookies with underscore removed', function () {
      setYahooJapanMeasurementCookies()

      treasure.collectTags({
        vendors: ['yahoojp_ads']
      })

      var globalTable = treasure.get('$global')

      expect(globalTable['ly_c']).to.equal('ly_c_value')
      expect(globalTable['ly_r']).to.equal('ly_r_value')
      expect(globalTable['ly_su']).to.equal('ly_su_value')
    })

    it('should collect _ly_c from URL parameter when cookie is missing', function () {
      // Mock window.location.search
      var originalLocation = window.location
      delete window.location
      window.location = { search: '?_ly_c=param_value' }

      treasure.collectTags({
        vendors: ['yahoojp_ads']
      })

      var globalTable = treasure.get('$global')

      expect(globalTable['ly_c']).to.equal('param_value')

      // Restore
      window.location = originalLocation
    })

    it('should prioritize cookie over parameter for _ly_c', function () {
      // Set cookie
      cookies.setItem('_ly_c', 'cookie_value', 5)

      // Mock URL parameter
      var originalLocation = window.location
      delete window.location
      window.location = { search: '?_ly_c=param_value' }

      treasure.collectTags({
        vendors: ['yahoojp_ads']
      })

      var globalTable = treasure.get('$global')

      // Cookie should override parameter
      expect(globalTable['ly_c']).to.equal('cookie_value')

      // Restore
      window.location = originalLocation
    })

    it('should maintain backward compatibility with existing Yahoo tags', function () {
      setYahooJapanLegacyCookies()

      treasure.collectTags({
        vendors: ['yahoojp_ads']
      })

      var globalTable = treasure.get('$global')

      expect(globalTable['_ycl_yjad']).to.equal('ycl_value')
      expect(globalTable['_yjr_yjad']).to.equal('yjr_value')
      expect(globalTable['_yjsu_yjad']).to.equal('yjsu_value')
    })

    it('should collect both new and legacy Yahoo tags together', function () {
      setYahooJapanMeasurementCookies()
      setYahooJapanLegacyCookies()

      treasure.collectTags({
        vendors: ['yahoojp_ads']
      })

      var globalTable = treasure.get('$global')

      // New measurement tags (without underscore)
      expect(globalTable['ly_c']).to.equal('ly_c_value')
      expect(globalTable['ly_r']).to.equal('ly_r_value')
      expect(globalTable['ly_su']).to.equal('ly_su_value')

      // Legacy tags (with underscore)
      expect(globalTable['_ycl_yjad']).to.equal('ycl_value')
      expect(globalTable['_yjr_yjad']).to.equal('yjr_value')
      expect(globalTable['_yjsu_yjad']).to.equal('yjsu_value')
    })
  })
})
