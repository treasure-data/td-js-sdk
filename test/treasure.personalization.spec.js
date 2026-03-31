var expect = require('expect.js')
var simple = require('simple-mock')
var Treasure = require('../lib/treasure')
var api = require('../lib/utils/xhr')

describe('Treasure Personalization', function () {
  it('adds fetchUserSegments method', function () {
    var td = new Treasure({ database: 'database', writeKey: 'writeKey' })
    expect(typeof td.fetchUserSegments === 'function').ok()
  })

  it('sets cdpHost config', function () {
    var td = new Treasure({ database: 'database', writeKey: 'writeKey' })
    expect(typeof td.client.cdpHost === 'string').ok()
  })

  it('sets cdpHost to the default value', function () {
    var td = new Treasure({ database: 'database', writeKey: 'writeKey' })
    expect(td.client.cdpHost).to.be('cdp.in.treasuredata.com')
  })

  it('sets cdpHost to the user provided value', function () {
    var td = new Treasure({
      database: 'database',
      writeKey: 'writeKey',
      cdpHost: 'test.host'
    })
    expect(td.client.cdpHost).to.be('test.host')
  })
  describe('first parameter', function () {
    it('should accept a string or array or object', function () {
      var td = new Treasure({
        database: 'database',
        writeKey: 'writeKey',
        cdpHost: 'test.host'
      })
      expect(function () { td.fetchUserSegments('token') }).not.to.throwException()
      expect(function () { td.fetchUserSegments(['token']) }).not.to.throwException()
      expect(function () { td.fetchUserSegments({ audienceToken: 'token' }) }).not.to.throwException()
      expect(function () {
        td.fetchUserSegments({
          audienceToken: 'token',
          keys: {
            someKey: 'someValue'
          }
        })
      }).not.to.throwException()
    })
    it('should not accept non string and non array non object', function () {
      var td = new Treasure({
        database: 'database',
        writeKey: 'writeKey',
        cdpHost: 'test.host'
      })
      expect(function () { td.fetchUserSegments(2) }).to.throwException()
      expect(function () { td.fetchUserSegments({ audienceToken: 2 }) }).to.throwException()
      expect(function () {
        td.fetchUserSegments({
          audienceToken: 'token',
          keys: '234'
        })
      }).to.throwException()
    })
  })
})

describe('User personalization', function() {
  var td

  beforeEach(function() {
    td = new Treasure({ database: 'database', writeKey: 'writeKey' })
  })

  afterEach(function() {
    td = null
  })

  it('fetchPersonalization function should be available', function() {
    expect(typeof td.fetchPersonalization === 'function').ok()
  })

  it('should not accept missing configuration', function() {
    expect(function() {
      td.fetchPersonalization()
    }).to.throwException()
  })

  it('should not accept empty configuration', function() {
    expect(function() {
      td.fetchPersonalization({})
    }).to.throwException()
  })

  it('endpoint should not be empty', function() {
    expect(function() {
      td.fetchPersonalization({
        database: 'db',
        table: 'tb',
        token: 'token'
      })
    }).to.throwException()
  })

  it('database should not be empty', function() {
    expect(function() {
      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        token: 'token'
      })
    }).to.throwException()
  })
  it('table should not be empty', function() {
    expect(function() {
      td.fetchPersonalization({
        endpoint: 'abc.com',
        database: 'db',
        token: 'token'
      })
    }).to.throwException()
  })
  it('token should not be empty', function() {
    expect(function() {
      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db'
      })
    }).to.throwException()
  })

  it('fetchPersonalization should be executed', function() {
    expect(function() {
      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      })
    }).not.to.throwException()
  })

  describe('privacy controls', function() {
    var apiPostSpy

    beforeEach(function() {
      apiPostSpy = simple.mock(api, 'post').resolveWith({})
    })

    afterEach(function() {
      simple.restore()
    })

    it('should not make request when events are blocked', function() {
      td.blockEvents()

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, { someData: 'value' })

      expect(apiPostSpy.callCount).to.be(0)
    })

    it('should make request when events are not blocked', function() {
      td.unblockEvents()

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, { someData: 'value' })

      expect(apiPostSpy.callCount).to.be(1)
    })

    it('should strip PII in anonymous mode', function() {
      td.setAnonymousMode()

      var payload = {
        someData: 'value',
        td_ip: '192.168.1.1',
        td_client_id: 'client123',
        td_global_id: 'global456',
        otherField: 'keep'
      }

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, payload)

      expect(apiPostSpy.callCount).to.be(1)
      var sentPayload = apiPostSpy.calls[0].args[1]
      expect(sentPayload).to.not.have.property('td_ip')
      expect(sentPayload).to.not.have.property('td_client_id')
      expect(sentPayload).to.not.have.property('td_global_id')
      expect(sentPayload).to.have.property('someData', 'value')
      expect(sentPayload).to.have.property('otherField', 'keep')
    })

    it('should preserve PII in signed mode', function() {
      td.setSignedMode()

      var payload = {
        someData: 'value',
        td_ip: '192.168.1.1',
        td_client_id: 'client123',
        td_global_id: 'global456',
        otherField: 'keep'
      }

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, payload)

      expect(apiPostSpy.callCount).to.be(1)
      var sentPayload = apiPostSpy.calls[0].args[1]
      expect(sentPayload).to.have.property('td_ip', '192.168.1.1')
      expect(sentPayload).to.have.property('td_client_id', 'client123')
      expect(sentPayload).to.have.property('td_global_id', 'global456')
      expect(sentPayload).to.have.property('someData', 'value')
      expect(sentPayload).to.have.property('otherField', 'keep')
    })

    it('should handle empty payload in anonymous mode', function() {
      td.setAnonymousMode()

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      })

      expect(apiPostSpy.callCount).to.be(1)
      var sentPayload = apiPostSpy.calls[0].args[1]
      expect(sentPayload).to.eql({})
    })

    it('should handle null payload in anonymous mode', function() {
      td.setAnonymousMode()

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, null)

      expect(apiPostSpy.callCount).to.be(1)
      var sentPayload = apiPostSpy.calls[0].args[1]
      expect(sentPayload).to.eql({})
    })

    it('should respect blocked events even in signed mode', function() {
      td.setSignedMode()
      td.blockEvents()

      td.fetchPersonalization({
        endpoint: 'abc.com',
        table: 'tb',
        database: 'db',
        token: 'wp13n-token'
      }, { someData: 'value' })

      expect(apiPostSpy.callCount).to.be(0)
    })
  })
})
