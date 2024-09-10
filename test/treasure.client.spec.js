var _ = require('lodash-compat')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var cookies = require('../lib/vendor/js-cookies')

// Copy the default config because we change it later in tests
var DEFAULT_CONFIG = _.clone(Treasure.prototype._configurator.DEFAULT_CONFIG)

describe('Treasure Client', function () {
  var treasure
  var configuration

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false,
      storage: {
        domain: 'localhost'
      }
    }
  }

  beforeEach(resetConfiguration)
  beforeEach(function () {
    treasure = new Treasure(configuration)
  })

  afterEach(function () {
    // Reset the config after each test to keep state cleaner
    Treasure.prototype._configurator.DEFAULT_CONFIG = _.clone(DEFAULT_CONFIG)
  })

  describe('DEFAULT_CONFIG', function () {
    beforeEach(resetConfiguration)

    it('should allow you to set default values', function () {
      Treasure.prototype._configurator.DEFAULT_CONFIG.host = 'foo.bar'
      treasure = new Treasure(configuration)
      expect(treasure.client.host).to.equal('foo.bar')
    })

    it('should allow you to overwrite default config', function () {
      Treasure.prototype._configurator.DEFAULT_CONFIG.host = 'foo.bar'
      configuration.host = 'bar.baz'
      treasure = new Treasure(configuration)
      expect(treasure.client.host).to.equal('bar.baz')
    })

    it('should allow objectless instantiation if all required values are defaults', function () {
      Treasure.prototype._configurator.DEFAULT_CONFIG.database = 'database'
      Treasure.prototype._configurator.DEFAULT_CONFIG.writeKey = 'writeKey'
      treasure = new Treasure()
      expect(treasure.client.database).to.equal('database')
      expect(treasure.client.writeKey).to.equal('writeKey')
    })

    it('should throw if writeKey is missing', function () {
      Treasure.prototype._configurator.DEFAULT_CONFIG.database = 'database'
      expect(function () {
        return new Treasure()
      }).to.throwException()
    })

    it('should throw if database is missing', function () {
      Treasure.prototype._configurator.DEFAULT_CONFIG.writeKey = 'writeKey'
      expect(function () {
        return new Treasure()
      }).to.throwException()
    })
  })

  describe('constructor', function () {
    it('should create a new Treasure instance when called without new', function () {
      expect(Treasure(configuration)).to.be.a(Treasure)
    })

    it('should create a new Treasure instance', function () {
      expect(treasure).to.be.a(Treasure)
    })

    it('should error if no configuration object', function () {
      expect(function () {
        (treasure = new Treasure())
      }).to.throwException()
    })

    it('should create a new client object', function () {
      expect(treasure.client).to.be.an('object')
    })

    it('should create a globals object on client', function () {
      expect(treasure.client.globals).to.be.an('object')
    })

    it('should set defaults on client object', function () {
      var client = treasure.client
      expect(client.host).to.be.a('string')
      expect(client.pathname).to.be.a('string')
      expect(client.requestType).to.be.a('string')
      expect(client.development).to.be.a('boolean')
      expect(client.logging).to.be.a('boolean')
      expect(client.endpoint).to.be.a('string')
      expect(client.jsonpTimeout).to.be.a('number')
    })

    it('should allow you to manually set values on client', function () {
      configuration.host = configuration.pathname = configuration.endpoint = 'foo'
      treasure = new Treasure(configuration)
      expect(treasure.client.host).to.equal('foo')
      expect(treasure.client.pathname).to.equal('foo')
      expect(treasure.client.endpoint).to.equal('foo')
    })

    describe('validates database', function () {
      var tryWithDatabaseValue = function (value) {
        configuration.database = value
        expect(function () {
          (treasure = new Treasure(configuration))
        }).to.throwException()
      }

      it('should error if database is absent', function () {
        tryWithDatabaseValue(undefined)
      })

      it('should error if database is of incorrect type', function () {
        // Number
        tryWithDatabaseValue(0)

        // Boolean
        tryWithDatabaseValue(false)

        // Array
        tryWithDatabaseValue(['array'])

        // Object
        tryWithDatabaseValue({})
      })

      it('should error if database is invalid', function () {
        // Empty string
        tryWithDatabaseValue('')

        // Under 3 characters
        tryWithDatabaseValue('12')

        // Over 255 characters
        tryWithDatabaseValue('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111')

        // Uppercase chracters
        tryWithDatabaseValue('FOO_BAR')

        // Special characters
        tryWithDatabaseValue('!@#$%ˆ&*()-+=')
      })

      it('should set the database (string)', function () {
        expect(typeof treasure.client.database).to.be('string')
        expect(treasure.client.database).to.equal(configuration.database)
      })
    })

    describe('validates writeKey', function () {
      it('should error if writeKey is not set', function () {
        delete configuration.writeKey
        expect(function () {
          (treasure = new Treasure(configuration))
        }).to.throwException()
      })

      it('should set the writeKey (string)', function () {
        expect(typeof treasure.client.writeKey).to.be('string')
        expect(treasure.client.writeKey).to.equal(configuration.writeKey)
      })
    })

    describe('validates endpoint', function () {
      it('should force https', function () {
        configuration.protocol = 'http'
        treasure = new Treasure(configuration)
        expect(treasure.client.endpoint.indexOf('https://')).to.equal(0)
      })
    })

    describe('validates request type', function () {
      it('should set request type to "fetch"', function () {
        expect(typeof treasure.client.requestType).to.be('string')
        expect(treasure.client.requestType).to.equal('fetch')
      })

      it('should always set request type to "fetch"', function () {
        configuration.requestType = 'xhr'
        treasure = new Treasure(configuration)
        expect(typeof treasure.client.requestType).to.be('string')
        expect(treasure.client.requestType).to.equal('fetch')
      })
    })

    describe('cookies', function () {
      it('should expose cookies.getItem', function () {
        treasure = new Treasure(configuration)
        expect(typeof treasure.getCookie).to.be('function')
        expect(treasure.getCookie).to.be(cookies.getItem)

        var cookieKey = 'testKey'
        var cookieVal = 'testVal'
        cookies.setItem(cookieKey, cookieVal, 6000)
        expect(treasure.getCookie(cookieKey)).to.be(cookieVal)
      })

      it('should get Google Analytics cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_ga'
        var cookieValue = 'google analytics'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getGoogleAnalyticsCookie()).to.be(cookieValue)
      })

      it('should get Google Conversion Linker cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_gcl_aw'
        var cookieValue = 'google cl'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getGoogleConversionLinkerCookie()).to.be(cookieValue)
      })

      it('should get Facebook 1st-party cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_fbp'
        var cookieValue = 'facebook 1st cookie'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getFacebook1stCookie()).to.be(cookieValue)
      })

      it('should get Facebook Click ID cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_fbc'
        var cookieValue = 'facebook click id'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getFacebookClickIDCookie()).to.be(cookieValue)
      })

      it('should get Yahoo CAPI cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_yjsu_yjad'
        var cookieValue = 'yahoo capi'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getYahooCAPICookie()).to.be(cookieValue)
      })

      it('should get Yahoo _ycl_yjad cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_ycl_yjad'
        var cookieValue = 'yahoo click id 1'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getYahooClickID_ycl_yjad_Cookie()).to.be(cookieValue)
      })

      it('should get Yahoo _yjr_yjad cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_yjr_yjad'
        var cookieValue = 'yahoo click id 2'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getYahooClickID_yjr_yjad_Cookie()).to.be(cookieValue)
      })

      it('should get Twitter Click ID cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '_twclid'
        var cookieValue = 'twitter click id'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getXClickIDCookie()).to.be(cookieValue)
      })
      it('should get Line cookie', function() {
        treasure = new Treasure(configuration)
        var cookieKey = '__lt__cid'
        var cookieValue = 'line cookie'

        cookies.setItem(cookieKey, cookieValue, 5)

        expect(treasure.getLineCookie()).to.be(cookieValue)
      })
    })
  })
})
