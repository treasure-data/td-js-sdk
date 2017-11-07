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
