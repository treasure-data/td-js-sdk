var window = require('global/window')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var Clicks = require('../lib/plugins/clicks')
var createTestElement = require('./helpers').createTestElement

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
    var button = createTestElement('button')
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
    var button = createTestElement('button')
    Clicks.trackClicks.call(td, {
      element: button
    })
    button.click()
  })

  it('calls trackEvent with the click info for a nested tag', function (done) {
    var td = {
      trackEvent: function (tableName, data) {
        expect(tableName === 'clicks').ok()
        expect(data.tag === 'a').ok()
        done()
      }
    }
    var link = createTestElement('a')
    var span = createTestElement('span', link)
    Clicks.trackClicks.call(td, {
      element: link
    })
    if (span.click) {
      span.click()
    } else {
      // Safari 5 on Windows 2008 special handling
      var ev = window.document.createEvent('MouseEvents')
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
      ev.initMouseEvent(
        'click',
        true,
        true,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        span
      )
      span.dispatchEvent(ev)
    }
  })

  it('calls extendClickData with the event and data', function (done) {
    var td = { trackEvent: function () {} }
    var button = createTestElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      extendClickData: function (event, data) {
        expect(event instanceof window.Event).ok()
        expect(data.tag === 'button').ok()
        done()
      }
    })
    button.click()
  })

  it('calls trackEvent with the result of extendClickData', function (done) {
    var emptyObject = {}
    var td = {
      trackEvent: function (tableName, data) {
        expect(data === emptyObject).ok()
        done()
      }
    }
    var button = createTestElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      extendClickData: function () {
        return emptyObject
      }
    })
    button.click()
  })

  it('only calls trackEvent if extendClickData returns truthy', function () {
    var trackEventCalls = 0
    var onClickCalls = 0
    var td = {
      trackEvent: function () {
        trackEventCalls++
      }
    }
    var button = createTestElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      extendClickData: function (event, data) {
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
    var button = createTestElement('button')
    Clicks.trackClicks.call(td, {
      element: button,
      ignoreAttribute: 'i-am-a-ninja'
    })
    button.click()
    button.setAttribute('i-am-a-ninja', true)
    button.click()
    expect(calls === 1).ok()
  })

  it('lets you dispose the click tracker', function () {
    var button = createTestElement('button')
    var trackEventCalls = 0
    var dispose = Clicks.trackClicks.call(
      {
        trackEvent: function () {
          trackEventCalls++
        }
      },
      {
        element: button
      }
    )
    button.click()
    dispose()
    button.click()
    expect(trackEventCalls === 1).ok()
  })

  describe('navigation', function() {
    var href = 'www.google.com'
    var link = createTestElement('a')
    link.setAttribute('href', href)

    var trackEventCalls
        , trackNavigation
        , trackNavigationArgs
        , callSuccessOrError = 'success'

    Clicks.trackClicks.call(
        {
          trackEvent: function (_, __, success, error) {
            trackEventCalls++

            if (callSuccessOrError === 'success') success()
            if (callSuccessOrError === 'error') error()
          },
          _clickNavigationHandler: function () {
            trackNavigation++
            trackNavigationArgs = Array.prototype.slice.call(arguments, [])
          }
        },
        {
          delayAnchorClicks: 100,
          element: window.document
        }
    )

    beforeEach(function() {
      trackEventCalls = 0
      trackNavigation = 0
      trackNavigationArgs = []
    })

    it('jump to top if anchor is clicked', function (cb) {
      var spacer = createTestElement('div')
      spacer.setAttribute('style', 'display: block; height: 10000px')
      var wrapper = createTestElement('div')
      wrapper.setAttribute('style', 'display: block')
      var target = createTestElement('a', wrapper)
      target.setAttribute('style', 'display: block')
      target.setAttribute('href', '#')
      target.innerHTML = 'test'
      window.scrollTo(0, 1000)
      /* make sure some scrolling happened. different browsers won't scroll
       * precisely to 1000px, so a relative test is better. as long as
       * pageYOffset is not zero scrolling happened, 800 seemed to be a good
       * cutoff during testing
       */
      expect(window.scrollY).to.equal(1000)

      target.click()

      expect(trackEventCalls).to.equal(1)
      setTimeout(function () {
        expect(window.scrollY).to.equal(0)
        expect(trackNavigation).to.equal(1)
        expect(trackNavigationArgs.length).to.equal(1)
        expect(trackNavigationArgs[0]).to.equal(target.getAttribute('href'))
        cb()
      }, 120)
    })
    it('should delay navigation if anchor tags and href is chosen', function (cb) {
      link.click()

      expect(trackEventCalls).to.equal(1)
      setTimeout(function () {
        expect(trackNavigation).to.equal(1)
        expect(trackNavigationArgs.length).to.equal(1)
        expect(trackNavigationArgs[0]).to.equal(href)
        cb()
      }, 120)
    })
    it('should delay navigation even if jsonp does not load within timeout', function (cb) {
      callSuccessOrError = 'neither'
      link.click()

      expect(trackEventCalls).to.equal(1)
      setTimeout(function () {
        expect(trackNavigation).to.equal(1)
        expect(trackNavigationArgs.length).to.equal(1)
        expect(trackNavigationArgs[0]).to.equal(href)
        cb()
      }, 120)
    })
    it('should continue the navigation event event if JSONP produced an error', function (cb) {
      callSuccessOrError = 'error'
      link.click()

      expect(trackEventCalls).to.equal(1)
      setTimeout(function () {
        expect(trackNavigation).to.equal(1)
        expect(trackNavigationArgs.length).to.equal(1)
        expect(trackNavigationArgs[0]).to.equal(href)
        cb()
      }, 120)
    })
  })
})
