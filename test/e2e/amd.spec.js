/* global Treasure */
var expect = require('expect.js')

describe('amd', function () {
  it('should be compatible with require.js', async function () {
    await browser.url('http://localhost:1337/fixtures/amd/index.html')
    await browser.timeouts('script', 5000)

    // RequireJS Module should load an execute correctly
    await browser.waitUntil(function () {
      return browser.getText('#rjs') === 'success'
    }, 5000, 'expected Require.js status to be success after 5s')

    var result = await browser.executeAsync(function (done) {
      var td = new Treasure({
        database: 'test_db_request',
        writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
        host: 'in-staging.treasuredata.com'
      })

      td.trackEvent('track_event', {date_string: (new Date()).toString()}, function () {
        done(true)
      }, function () {
        done(false)
      })
    })

    expect(result.value).to.be(true)
  })
})
