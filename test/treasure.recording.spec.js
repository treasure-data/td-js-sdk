var sinon = require('sinon')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')

describe('Treasure Record', function () {
  var treasure, configuration

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      logging: false,
      development: true
    }
  }
  beforeEach(resetConfiguration)

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
          tryAddRecordWithValues('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111', {})

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
        configuration.development = false
        treasure = new Treasure(configuration)
        sinon.stub(treasure, '_sendRecord')
      })

      afterEach(function () {
        treasure._sendRecord.restore()
      })

      it('should send the object with $global attributes', function () {
        treasure.set('$global', {foo: 'foo'})
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('foo', 'foo')
      })

      it('should send the object with table attributes', function () {
        treasure.set('table', {foo: 'foo'})
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('foo', 'foo')
      })

      it('should send the object with $global and table attributes', function () {
        treasure.set('$global', {foo: 'foo'})
        treasure.set('table', {bar: 'bar'})
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('foo', 'foo')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('bar', 'bar')
      })

      it('should send the object with $global, table, and record attributes', function () {
        treasure.set('$global', {foo: 'foo'})
        treasure.set('table', {bar: 'bar'})
        treasure.addRecord('table', {baz: 'baz'})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('foo', 'foo')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('bar', 'bar')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('baz', 'baz')
      })

      it('should send the object with record attributes overwriting globals', function () {
        treasure.set('$global', {foo: 'foo', bar: 'bar'})
        treasure.set('table', {baz: 'baz', qux: 'qux'})
        treasure.addRecord('table', {bar: '1', qux: '2'})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('foo', 'foo')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('bar', '1')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('baz', 'baz')
        expect(treasure._sendRecord.firstCall.args[0].record).to.have.property('qux', '2')
      })
    })

    describe('properties', function () {
      beforeEach(function () {
        configuration.development = false
        configuration.protocol = 'http:'
        configuration.requestType = 'jsonp'
        configuration.writeKey = 'apikey'
        treasure = new Treasure(configuration)
        sinon.stub(treasure, '_sendRecord')
      })

      afterEach(function () {
        treasure._sendRecord.restore()
      })

      it('should set url', function () {
        var url = 'http://in.treasuredata.com/js/v3/event/database/table'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].url).to.equal(url)
      })

      it('should set type', function () {
        var requestType = 'jsonp'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].type).to.equal(requestType)
      })

      it('should set apikey', function () {
        var apikey = 'apikey'
        treasure.addRecord('table', {})

        expect(treasure._sendRecord.calledOnce).to.equal(true)
        expect(treasure._sendRecord.firstCall.args[0]).to.be.an('object')
        expect(treasure._sendRecord.firstCall.args[0].apikey).to.equal(apikey)
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
      var result = treasure.applyProperties('table', {baz: 'qux'})
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
      var result = treasure.applyProperties('table', {foo: 'foo'})
      expect(result).to.have.property('foo', 'foo')
      expect(getKeys(result)).to.have.length(1)
    })
  })
})
