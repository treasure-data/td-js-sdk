var sinon = require('sinon')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var checkUUID = require('../lib/utils/checkUUID')
// var parseDomain = require('parse-domain')

describe('Treasure Tracker', function () {
  var treasure, configuration, spy

  function getKeys (obj) {
    var keys = []
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key)
      }
    }
    return keys
  }

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false
    }
  }

  beforeEach(resetConfiguration)
  beforeEach(function () {
    treasure = new Treasure(configuration)
    spy = sinon.spy(Treasure.prototype, 'addRecord')
  })

  afterEach(function () {
    spy.restore()
  })

  describe('#configure', function () {
    it('should call configure', function () {
      var configSpy = sinon.spy(Treasure.Plugins.Track, 'configure')
      treasure = new Treasure(configuration)

      expect(configSpy.calledOnce).to.equal(true)
      expect(configSpy.firstCall.args).to.have.length(1)
      expect(configSpy.firstCall.args[0]).to.be.an('object')
      configSpy.restore()
    })

    it('should set default storage values', function () {
      var storage = treasure.client.storage
      expect(typeof storage === 'object').ok()
      expect(storage.name === '_td').ok()
      expect(storage.expires === 63072000).ok()

      // var result = parseDomain(document.location.hostname, {})
      // if (result) {
      //   expect(storage.domain).to.equal(result.domain + '.' + result.tld)
      // } else {
      //   expect(storage.domain).to.equal(document.location.hostname)
      // }
    })

    it('should set default track values', function () {
      var track = treasure.client.track
      expect(track).to.be.an('object')
      expect(track.values).to.be.an('object')
    })

    it('should set uuid to clientId if set manually', function () {
      var value = 'abcdef-ghijklmn-opqr-stuv-wxyz'
      configuration.clientId = value
      treasure = new Treasure(configuration)

      expect(treasure.client.track.uuid).to.equal(value)
    })

    it('should set a new UUID if you choose a UUID with insufficient entropy', function () {
      var value = 'abc'
      configuration.clientId = value
      treasure = new Treasure(configuration)

      expect(treasure.client.track.uuid).to.not.equal(value)
      expect(checkUUID(treasure.client.track.uuid)).to.equal(true)

      value = '00000000-0000-4000-8000-000000000000'
      configuration.clientId = value
      treasure = new Treasure(configuration)

      expect(treasure.client.track.uuid).to.not.equal(value)
      expect(checkUUID(treasure.client.track.uuid)).to.equal(true)
    })

    it('should strip NULL characters from clientId', function () {
      configuration.clientId = 'abcdef-ghijklmn-opqr-stuv-wxyz\0\0\0'
      treasure = new Treasure(configuration)

      expect(treasure.client.track.uuid).to.equal('abcdef-ghijklmn-opqr-stuv-wxyz')
    })

    describe('track values', function () {
      var track = {values: {}}

      it('should set defaults', function () {
        var values = treasure.client.track.values
        expect(values).to.be.an('object')
        expect(values.td_version).to.be.a('function')
        expect(values.td_client_id).to.be.a('function')
        expect(values.td_charset).to.be.a('function')
        expect(values.td_language).to.be.a('function')
        expect(values.td_color).to.be.a('function')
        expect(values.td_screen).to.be.a('function')
        expect(values.td_viewport).to.be.a('function')
        expect(values.td_ip).to.be.a('function')
        expect(values.td_browser).to.be.a('function')
        expect(values.td_browser_version).to.be.a('function')
        expect(values.td_os).to.be.a('function')
        expect(values.td_os_version).to.be.a('function')
        expect(values.td_title).to.be.a('function')
        expect(values.td_url).to.be.a('function')
        expect(values.td_host).to.be.a('function')
        expect(values.td_path).to.be.a('function')
        expect(values.td_referrer).to.be.a('function')
      })

      it('should let you overwrite values', function () {
        track.values.td_version = function () {
          return 'foo'
        }

        configuration.track = track
        treasure = new Treasure(configuration)

        expect(treasure.client.track.values.td_version()).to.equal('foo')
      })

      it('should let you disable values', function () {
        track.values.td_version = false

        configuration.track = track
        treasure = new Treasure(configuration)

        expect(treasure.client.track.values.td_version).to.equal(false)
      })

      it('should let you set new values', function () {
        track.values.foo = function () {
          return 'foo'
        }

        configuration.track = track
        treasure = new Treasure(configuration)

        expect(treasure.client.track.values.foo()).to.equal('foo')
      })
    })

    describe('cookies', function () {
      it('should let you disable storage by setting it to none', function () {
        configuration.storage = 'none'
        treasure = new Treasure(configuration)

        expect(treasure.client.storage).to.equal(false)
      })

      it('should let you set expiration to 0', function () {
        configuration.storage = {
          expiration: 0
        }
        treasure = new Treasure(configuration)

        expect(treasure.client.storage.expiration).to.equal(0)
      })

      it('should let you set expiration to an integer', function () {
        configuration.storage = {
          expiration: 128
        }
        treasure = new Treasure(configuration)

        expect(treasure.client.storage.expiration).to.equal(128)
      })

      it('should remember your previous clientId', function () {
        configuration = {
          database: 'database',
          writeKey: 'writeKey',
          clientId: 'abcdef-ghijklmn-opqr-stuv-wxyz',
          development: true,
          logging: false
        }
        treasure = new Treasure(configuration)
        expect(treasure.client.track.uuid).to.equal(configuration.clientId)

        configuration = {
          database: 'database',
          writeKey: 'writeKey',
          development: true,
          logging: false
        }
        treasure = new Treasure(configuration)
        expect(treasure.client.track.uuid).to.equal(configuration.clientId)
      })
    })
  })

  describe('#trackPageview', function () {
    it('should work with no parameters', function () {
      treasure.trackPageview()
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('pageviews')
      expect(spy.firstCall.args[1]).to.be.an('object')
    })

    it('should allow you to set the table', function () {
      treasure.trackPageview('foobar')
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('foobar')
      expect(spy.firstCall.args[1]).to.be.an('object')
    })

    it('should allow you to pass success callback', function () {
      var success = function () {}
      treasure.trackPageview('foo', success)
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('foo')
      expect(spy.firstCall.args[1]).to.be.an('object')
      expect(spy.firstCall.args[2]).to.equal(success)
    })

    it('should take success and failure callback when all parameters are passed', function () {
      var success = function () {}
      var failure = function () {}

      treasure.trackPageview('foo', success, failure)
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('foo')
      expect(spy.firstCall.args[1]).to.be.an('object')
      expect(spy.firstCall.args[2]).to.equal(success)
      expect(spy.firstCall.args[3]).to.equal(failure)
    })

    it('should pass all track values', function () {
      var trackValues = treasure.getTrackValues()
      treasure.trackPageview()
      expect(spy.calledOnce).to.equal(true)

      var callKeys = getKeys(spy.firstCall.args[1])
      expect(callKeys).to.eql(getKeys(trackValues))
    })
  })

  describe('#trackEvent', function () {
    it('should use default events table', function () {
      treasure.trackEvent()
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('events')
      expect(spy.firstCall.args[1]).to.be.an('object')
    })

    it('should work when only table is passed', function () {
      treasure.trackEvent('table')
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('table')
      expect(spy.firstCall.args[1]).to.be.an('object')
    })

    it('should allow you to set the table', function () {
      treasure.trackEvent('foobar')
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('foobar')
      expect(spy.firstCall.args[1]).to.be.an('object')
    })

    it('should allow you to pass normal parameters', function () {
      treasure.trackEvent('table', {foo: 'bar'})
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('table')
      expect(spy.firstCall.args[1]).to.be.an('object')
      expect(spy.firstCall.args[1].foo).to.equal('bar')
    })

    it('should take two callbacks when all parameters are passed', function () {
      var success = function () {}
      var failure = function () {}

      treasure.trackEvent('foo', {foo: 'bar'}, success, failure)
      expect(spy.calledOnce).to.equal(true)
      expect(spy.firstCall.args[0]).to.equal('foo')
      expect(spy.firstCall.args[1]).to.be.an('object')
      expect(spy.firstCall.args[1].foo).to.equal('bar')
      expect(spy.firstCall.args[2]).to.equal(success)
      expect(spy.firstCall.args[3]).to.equal(failure)
    })

    it('should pass all track values', function () {
      var trackValues = treasure.getTrackValues()
      treasure.trackEvent()
      expect(spy.calledOnce).to.equal(true)

      var callKeys = getKeys(spy.firstCall.args[1])
      expect(callKeys).to.eql(getKeys(trackValues))
    })
  })
})
