var expect = require('expect.js')
var Treasure = require('../lib/treasure')

describe('Treasure Personalization', function () {
  it('adds fetchUserSegments method', function () {
    var td = new Treasure({ database: 'database', writeKey: 'writeKey' })
    expect(typeof td.fetchUserSegments === 'function').ok()
  })
})
