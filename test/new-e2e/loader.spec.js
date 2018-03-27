/* global Treasure */
var expect = require('expect.js')

describe('loader', function () {
  it('is a smoketest', async function () {
    await browser.timeouts('script', 5000)
    await browser.url('http://localhost:1337/fixtures/loader/index.html')

    var result = await browser.executeAsync(function (done) {
      var status = []

      function success () {
        status.push(true)
        if (status.length === 4) {
          done(status)
        }
      }

      function failure () {
        status.push(false)
        if (status.length === 4) {
          done(status)
        }
      }

      var td = new Treasure({
        database: 'test_db_request',
        writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
        host: 'in-staging.treasuredata.com'
      })

      td.addRecord('loader_add_record', {}, success, failure)

      td.trackEvent('loader_track_event', {}, success, failure)

      td.trackPageview('loader_track_pageview', function () {
        success()

        var td2 = new Treasure({
          database: 'test_db_request',
          writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
          host: 'in-staging.treasuredata.com'
        })

        td2.trackPageview('loader_track_pageview', success, failure)
      }, failure)
    })

    expect(result.value).to.eql([true, true, true, true])
  })
})
