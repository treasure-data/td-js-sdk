var test = require('tape')

module.exports = function (browser, initOpts, finish) {
  test('loader test', function (t) {
    var count = 4
    t.plan(4)

    function finished () {
      count--
      if (count === 0) {
        t.end()
        browser.quit()
        finish()
      }
    }

    function initTest () {
      browser.get('http://localhost:9999/fixtures/loader', function () {
        getStatus(0)
        getStatus(1)
        getStatus(2)
        getStatus(3)
      })
    }

    function getStatus (num) {
      browser.elementById('status' + num, function (err, el) {
        return err ? t.fail('Error', err) : el.text(getText(num))
      })
    }

    function getText (num) {
      return function (err, text) {
        if (err) {
          t.fail('Error', err)
          return finished()
        }
        switch (text) {
          case 'success':
            t.pass('status is success')
            return finished()
          case 'failure':
            t.fail('status is failure')
            return finished()
          default:
            return getStatus(num)
        }
      }
    }

    browser.init(initOpts, initTest)
  })
}
