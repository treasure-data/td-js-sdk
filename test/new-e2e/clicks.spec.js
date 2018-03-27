/* global Treasure */
var expect = require('expect.js')

describe('trackClicks', function () {
  it('should trigger extendClickData', async function () {
    await browser.url('http://localhost:1337/fixtures/clicks/index.html')
    await browser.timeouts('script', 5000)

    await browser.execute(function () {
      var td = new Treasure({
        database: 'test_db_request',
        host: 'in-staging.treasuredata.com',
        writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018'
      })

      window.extendClickDataCalled = false

      td.trackClicks({
        extendClickData: function (event, data) {
          window.extendClickDataCalled = true
          return data
        }
      })
    })

    await browser.click('#button')

    var result = await browser.executeAsync(function (done) {
      done(window.extendClickDataCalled)
    })

    expect(result.value).to.be(true)
  })
})
