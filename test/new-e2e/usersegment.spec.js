/* global Treasure */
var expect = require('expect.js')

describe('addRecord', function () {
  it('is a smoketest', async function () {
    await browser.url('http://localhost:1337/fixtures/event/index.html')
    await browser.timeouts('script', 5000)

    await browser.execute(function () {
      window.td = new Treasure({
        database: 'test_db_request',
        writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
        host: 'in-staging.treasuredata.com'
      })
    })

    var result1 = await browser.executeAsync(function (done) {
      window.td.fetchUserSegments({
        audienceToken: ['05e97f6c-e56c-41a2-bf69-a2ead74dd89d'],
        keys: {
          email: 'someone@somewhere.com'
        }
      }, function (keys) {
        if (keys !== undefined) {
          done(true)
        } else {
          done(false)
        }
      }, function () {
        done(false)
      })
    })
    expect(result1.value).to.be(true)

    var result2 = await browser.executeAsync(function (done) {
      window.td.fetchUserSegments('55198252-3752-4a1f-b011-62a821cae61d', function (key) {
        if (key !== undefined) {
          done(true)
        } else {
          done(false)
        }
      }, function () {
        done(false)
      })
    })
    expect(result2.value).to.be(true)
  })
})
