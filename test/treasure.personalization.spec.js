var expect = require('expect.js')
var Treasure = require('../lib/treasure')

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
})
