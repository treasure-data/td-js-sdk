/* global Treasure */
var expect = require('expect.js')

describe('addRecord', function () {
  it('is a smoketest', async function () {
    await browser.url('http://localhost:1337/fixtures/generic/index.html')
    await browser.timeouts('script', 5000)

    var result = await browser.executeAsync(function (done) {
      var td = new Treasure({
        database: 'test_db_request',
        writeKey: '91/96da3cfb876cc50724d0dddef670d95eea2a0018',
        host: 'in-staging.treasuredata.com'
      })

      td.addRecord('add_record', { ramen: 'ラーメン' }, function () {
        done(true)
      }, function () {
        done(false)
      })
    })

    expect(result.value).to.be(true)
  })
})
