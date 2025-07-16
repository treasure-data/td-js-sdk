var simple = require('simple-mock')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')

describe('UTM parameters tracking', function() {
  var configuration = {
    database: 'database',
    writeKey: 'writeKey',
    development: true,
    logging: false,
    startInSignedMode: true
  }

  beforeEach(function() {
    if (history.pushState) {
      var url = new URL(window.location)
      url.searchParams.set('utm_id', '1')
      url.searchParams.set('utm_medium', 'medium')
      url.searchParams.set('utm_source_platform', 'source platform')
      url.searchParams.set('utm_source', 'source')
      url.searchParams.set('utm_campaign', 'campaign')
      url.searchParams.set('utm_marketing_tactic', 'tactic')
      window.history.pushState({}, '', url);
    }
  });

  it('configuration', function() {
    var td = new Treasure(configuration)

    // get $global table
    var globalTable = td.get()

    expect(globalTable.utm_id).to.equal('1')
    expect(globalTable.utm_medium).to.equal('medium')
    expect(globalTable.utm_source_platform).to.equal('source platform')
    expect(globalTable.utm_source).to.equal('source')
    expect(globalTable.utm_campaign).to.equal('campaign')
    expect(globalTable.utm_marketing_tactic).to.equal('tactic')
  })
})
