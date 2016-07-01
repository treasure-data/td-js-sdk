var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var Clicks = require('../lib/plugins/clicks')

describe('Treasure Clicks', function () {
  it('adds trackClicks method', function () {
    var td = new Treasure({ database: 'database', writeKey: 'writeKey' })
    expect(typeof td.trackClicks === 'function').ok()
  })

  it('initializes _clickTrackingInstalled when config is called', function () {
    var td = {}
    Clicks.configure.call(td)
    expect(td._clickTrackingInstalled === false).ok()
  })

  it('sets _clickTrackingInstalled when click tracking is setup', function () {
    var td = {}
    var button = document.createElement('button')
    Clicks.trackClicks.call(td, {
      element: button
    })
    expect(td._clickTrackingInstalled === true)
  })

  it('calls trackEvent with the click info', function (done) {
    var td = {
      trackEvent: function (tableName, data) {
        expect(tableName === 'clicks').ok()
        expect(data.tag === 'button').ok()
        done()
      }
    }
    var button = document.createElement('button')
    Clicks.trackClicks.call(td, {
      element: button
    })
    button.click()
  })

  it('calls onClick with the event and data', function (done) {
    var td = { trackEvent: function () {} }
    var button = document.createElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      onClick: function (event, data) {
        expect(event instanceof window.Event).ok()
        expect(data.tag === 'button').ok()
        done()
      }
    })
    button.click()
  })

  it('calls trackEvent with the result of onClick', function (done) {
    var emptyObject = {}
    var td = {
      trackEvent: function (tableName, data) {
        expect(data === emptyObject).ok()
        done()
      }
    }
    var button = document.createElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      onClick: function () {
        return emptyObject
      }
    })
    button.click()
  })

  it('only calls trackEvent if onClick returns truthy', function () {
    var trackEventCalls = 0
    var onClickCalls = 0
    var td = {
      trackEvent: function () {
        trackEventCalls++
      }
    }
    var button = document.createElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      onClick: function (event, data) {
        onClickCalls++
        return trackEventCalls === 0 ? data : null
      }
    })
    button.click()
    button.click()
    button.click()
    expect(onClickCalls === 3).ok()
    expect(trackEventCalls === 1).ok()
  })

  it('lets you set ignoreAttribute', function () {
    var calls = 0
    var td = {
      trackEvent: function () {
        calls++
      }
    }
    var a = document.createElement('a')
    Clicks.trackClicks.call(td, {
      element: a,
      ignoreAttribute: 'i-am-a-ninja'
    })
    a.click()
    a.setAttribute('i-am-a-ninja', true)
    a.click()
    expect(calls === 1).ok()
  })
})
