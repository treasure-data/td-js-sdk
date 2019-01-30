var simple = require('simple-mock')
var expect = require('expect.js')
var _ = require('../lib/utils/lodash')
var cookie = require('../lib/vendor/js-cookies')
var Treasure = require('../lib/treasure')
var config = require('../lib/config')
var record = require('../lib/record')

var BLOCKEVENTSCOOKIE = record.BLOCKEVENTSCOOKIE
var SIGNEDMODECOOKIE = record.SIGNEDMODECOOKIE

describe('Treasure Record', function () {
  var treasure, configuration

  function resetConfiguration (options) {
    configuration = _.assign({
      database: 'database',
      writeKey: 'writeKey',
      logging: false,
      development: true
    }, options)
  }
  beforeEach(function () {
    resetConfiguration()
  })

  describe('#addRecord', function () {
    describe('validation', function () {
      beforeEach(function () {
        treasure = new Treasure(configuration)
      })

      var tryAddRecordWithValues = function (table, value) {
        expect(function () {
          treasure.addRecord(table, value)
        }).to.throwException()
      }

      describe('event', function () {
        it('should error if event is absent', function () {
          tryAddRecordWithValues('table')
        })

        it('should error if event is of incorrect type', function () {
          // Number
          tryAddRecordWithValues('table', 0)

          // Boolean
          tryAddRecordWithValues('table', false)

          // Null
          tryAddRecordWithValues('table', null)

          // String
          tryAddRecordWithValues('table', 'String')
        })
      })

      describe('table', function () {
        it('should error if table is absent', function () {
          tryAddRecordWithValues()
        })

        it('should error if table is empty', function () {
          tryAddRecordWithValues('')
        })

        it('should error if table is of incorrect type', function () {
          // Number
          tryAddRecordWithValues(0)

          // Boolean
          tryAddRecordWithValues(false)

          // Array
          tryAddRecordWithValues(['array'])

          // Object
          tryAddRecordWithValues({})
        })

        it('should error if table is invalid', function () {
          // Under 3 characters
          tryAddRecordWithValues('12', {})

          // Over 255 characters
          tryAddRecordWithValues(
            '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
            {}
          )

          // Uppercase chracters
          tryAddRecordWithValues('FOO_BAR', {})

          // Special characters
          tryAddRecordWithValues('!@#$%ˆ&*()-+=', {})
        })

        it('should accept a valid table', function () {
          expect(function () {
            treasure.addRecord('table', {})
          }).to.not.throwException()
        })
      })
    })

    describe('globals', function () {
      beforeEach(function () {
        resetConfiguration({ development: false })
        treasure = new Treasure(configuration)
        simple.mock(treasure, '_sendRecord')
      })

      afterEach(function () {
        simple.restore()
      })

      it('should send the object with $global attributes', function () {
        treasure.set('$global', { foo: 'foo' })
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'foo',
          'foo'
        )
      })

      it('should send the object with table attributes', function () {
        treasure.set('table', { foo: 'foo' })
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'foo',
          'foo'
        )
      })

      it('should send the object with $global and table attributes', function () {
        treasure.set('$global', { foo: 'foo' })
        treasure.set('table', { bar: 'bar' })
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'foo',
          'foo'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'bar',
          'bar'
        )
      })

      it('should send the object with $global, table, and record attributes', function () {
        treasure.set('$global', { foo: 'foo' })
        treasure.set('table', { bar: 'bar' })
        treasure.addRecord('table', { baz: 'baz' })

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'foo',
          'foo'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'bar',
          'bar'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'baz',
          'baz'
        )
      })

      it('should send the object with record attributes overwriting globals', function () {
        treasure.set('$global', { foo: 'foo', bar: 'bar' })
        treasure.set('table', { baz: 'baz', qux: 'qux' })
        treasure.addRecord('table', { bar: '1', qux: '2' })

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'foo',
          'foo'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'bar',
          '1'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'baz',
          'baz'
        )
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property(
          'qux',
          '2'
        )
      })
    })

    describe('properties', function () {
      beforeEach(function () {
        resetConfiguration({
          development: false,
          requestType: 'jsonp',
          writeKey: 'apikey'
        })
        treasure = new Treasure(configuration)
        simple.mock(treasure, '_sendRecord')
      })

      afterEach(function () {
        simple.restore()
      })

      it('should set url', function () {
        var url = 'https://' + config.HOST + config.PATHNAME + 'database/table'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].url).to.equal(url)
      })

      it('should set type', function () {
        var requestType = 'jsonp'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].type).to.equal(requestType)
      })

      it('should set apikey', function () {
        var apikey = 'apikey'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(1)
        expect(treasure._sendRecord.calls[0].args[0]).to.be.an('object')
        expect(treasure._sendRecord.calls[0].args[0].apikey).to.equal(apikey)
      })

      it('should use record time when present', function () {
        treasure.addRecord('table', { time: 1 })
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.callCount).to.equal(2)
        expect(treasure._sendRecord.calls[0].args[0].time).to.equal(1)
        expect(treasure._sendRecord.calls[1].args[0].time).to.equal(null)
      })
    })
  })

  describe('#applyProperties', function () {
    var getKeys = function (obj) {
      var keys = []
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key)
        }
      }
      return keys
    }

    beforeEach(function () {
      treasure = new Treasure(configuration)
    })

    it('should apply $global properties', function () {
      treasure.set('$global', 'foo', 'bar')
      var result = treasure.applyProperties('table', {})
      expect(result).to.be.an('object')
      expect(result).to.have.property('foo', 'bar')
      expect(getKeys(result)).to.have.length(1)
    })

    it('should apply table properties', function () {
      treasure.set('table', 'foo', 'bar')
      var result = treasure.applyProperties('table', {})
      expect(result).to.be.an('object')
      expect(result).to.have.property('foo', 'bar')
      expect(getKeys(result)).to.have.length(1)
    })

    it('should apply both table and $global properties', function () {
      treasure.set('$global', 'foo', 'bar')
      treasure.set('table', 'bar', 'foo')
      var result = treasure.applyProperties('table', {})
      expect(result).to.be.an('object')
      expect(result).to.have.property('foo', 'bar')
      expect(result).to.have.property('bar', 'foo')
      expect(getKeys(result)).to.have.length(2)
    })

    it('should apply $global, table, and payload properties', function () {
      treasure.set('$global', 'foo', 'bar')
      treasure.set('table', 'bar', 'foo')
      var result = treasure.applyProperties('table', { baz: 'qux' })
      expect(result).to.be.an('object')
      expect(result).to.have.property('foo', 'bar')
      expect(result).to.have.property('bar', 'foo')
      expect(result).to.have.property('baz', 'qux')
      expect(getKeys(result)).to.have.length(3)
    })

    it('should favor table properties over $global', function () {
      treasure.set('$global', 'foo', 'bar')
      treasure.set('table', 'foo', 'foo')
      var result = treasure.applyProperties('table', {})
      expect(result).to.have.property('foo', 'foo')
      expect(getKeys(result)).to.have.length(1)
    })

    it('should favor payload properties over table', function () {
      treasure.set('table', 'foo', 'bar')
      var result = treasure.applyProperties('table', { foo: 'foo' })
      expect(result).to.have.property('foo', 'foo')
      expect(getKeys(result)).to.have.length(1)
    })
  })

  describe('GDPR', function () {
    beforeEach(function () {
      resetConfiguration({ development: false })
      treasure = new Treasure(configuration)
      simple.mock(treasure, '_sendRecord')
    })

    afterEach(function () {
      simple.restore()
    })

    it('blockEvents() should stop all events from being sent', function () {
      expect(treasure._sendRecord.callCount).to.be(0)
      treasure.addRecord('foo', {})
      expect(treasure._sendRecord.callCount).to.be(1)
      treasure._sendRecord.reset()

      treasure.blockEvents()

      expect(treasure._sendRecord.callCount).to.be(0)
      treasure.addRecord('foo', {})
      treasure.addRecord('foo', {})
      treasure.addRecord('foo', {})
      expect(treasure._sendRecord.callCount).to.be(0)
    })

    it('unblockEvents() should allow sending events again', function () {
      expect(treasure._sendRecord.callCount).to.be(0)
      treasure.blockEvents()
      treasure.addRecord('foo', {})
      treasure.addRecord('foo', {})
      treasure.addRecord('foo', {})
      expect(treasure._sendRecord.callCount).to.be(0)

      treasure.unblockEvents()

      expect(treasure._sendRecord.callCount).to.be(0)
      treasure.addRecord('foo', {})
      expect(treasure._sendRecord.callCount).to.be(1)
    })

    it('areEventsBlocked() should appropriately return the status of event-blocking', function () {
      treasure.blockEvents()

      expect(treasure.areEventsBlocked()).to.be(true)

      treasure.unblockEvents()

      expect(treasure.areEventsBlocked()).to.be(false)
    })

    it('events are by default unblocked', function () {
      cookie.removeItem(BLOCKEVENTSCOOKIE)
      treasure.addRecord('foo', {})
      expect(treasure._sendRecord.callCount).to.be(1)
    })

    describe('Signed Mode', function () {
      beforeEach(function () {
        cookie.removeItem(SIGNEDMODECOOKIE)
      })

      it('should send the generated PII records in tracking values if desired', function () {
        treasure.setSignedMode()
        treasure.trackEvent('foo', {})
        expect(treasure._sendRecord.callCount).to.be(1)
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property('td_ip')
        expect(treasure._sendRecord.calls[0].args[0].record).to.have.property('td_client_id')
      })
      it('should be in Anonymous Mode by default', function () {
        treasure.trackEvent('foo', {})
        expect(treasure._sendRecord.callCount).to.be(1)
        expect(treasure._sendRecord.calls[0].args[0].record).not.to.have.property('td_ip')
        expect(treasure._sendRecord.calls[0].args[0].record).not.to.have.property('td_client_id')
      })
      it('should block the generated PII records from being sent in tracking values if desired', function () {
        treasure.setAnonymousMode()
        treasure.trackEvent('foo', {})
        expect(treasure._sendRecord.callCount).to.be(1)
        expect(treasure._sendRecord.calls[0].args[0].record).not.to.have.property('td_ip')
        expect(treasure._sendRecord.calls[0].args[0].record).not.to.have.property('td_client_id')
      })
      it('should block the generated PII records from being sent in set values as well', function () {
        treasure.set('$global', 'td_global_id', 'td_global_id')
        treasure.setAnonymousMode()
        treasure.trackEvent('foo', {})
        expect(treasure._sendRecord.callCount).to.be(1)
        expect(treasure._sendRecord.calls[0].args[0].record).not.to.have.property('td_global_id')
      })
      it('inSignedMode() will return true if in Signed Mode', function () {
        expect(treasure.inSignedMode()).to.be(false)
        treasure.setSignedMode()
        expect(treasure.inSignedMode()).to.be(true)
        treasure.setAnonymousMode()
        expect(treasure.inSignedMode()).to.be(false)
      })
      describe('startInSignedMode', function () {
        function makeNewTD (startInSignedMode) {
          resetConfiguration({
            startInSignedMode: startInSignedMode
          })
          treasure = new Treasure(configuration)
        }

        it('will favor cookies if set', function () {
          cookie.setItem(SIGNEDMODECOOKIE, 'true')
          makeNewTD(false)
          expect(treasure.inSignedMode()).to.be(true)

          cookie.setItem(SIGNEDMODECOOKIE, 'false')
          makeNewTD(true)
          expect(treasure.inSignedMode()).to.be(false)
        })
        it('will start in Signed Mode if cookie is not set', function () {
          cookie.removeItem(SIGNEDMODECOOKIE)
          makeNewTD(false)
          expect(treasure.inSignedMode()).to.be(false)

          expect(cookie.getItem(SIGNEDMODECOOKIE)).to.not.be.ok()
          makeNewTD(true)
          expect(treasure.inSignedMode()).to.be(true)
        })
      })
    })
  })
})
