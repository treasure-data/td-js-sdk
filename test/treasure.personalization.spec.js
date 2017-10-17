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
})
