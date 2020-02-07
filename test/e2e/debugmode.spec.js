var test = require('tape')

module.exports = function (browser, initOpts, finish) {
  test('pageview test', function (t) {
    t.plan(1)

    function initTest () {
      browser.get('http://localhost:9999/fixtures/debugmode', getStatus)
    }

    function getStatus () {
      browser.elementById('status', function (err, el) {
        return err ? t.fail('Error', err) : el.text(getText)
      })
    }

    function getText (err, text) {
      if (err) {
        t.fail('Error', err)
        t.end()
        browser.quit()
        return finish()
      }
      switch (text) {
        case 'success':
          t.pass('status is success')
          break
        case 'failure':
          t.fail('status is failure')
          break
        default:
          return getStatus()
      }
      t.end()
      browser.quit()
      finish()
    }

    browser.init(initOpts, initTest)
  })
}
