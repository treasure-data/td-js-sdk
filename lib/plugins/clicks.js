var window = require('global/window')
var elementUtils = require('../utils/element')
var assign = require('../utils/lodash').assign
var disposable = require('../utils/misc').disposable

function defaultExtendClickData (event, data) {
  return data
}

function configure () {
  this._clickTrackingInstalled = false
  this._clickNavigationHandler = function (href) {
    window.location.href = href
  }
}

function trackClicks (trackClicksOptions) {
  if (this._clickTrackingInstalled) return

  var instance = this
  var options = assign(
    {
      element: window.document,
      extendClickData: defaultExtendClickData,
      ignoreAttribute: 'td-ignore',
      tableName: 'clicks'
    },
    trackClicksOptions,
    {
      delayAnchorClicks: Math.max(0, trackClicksOptions.delayAnchorClicks || 10)
    }
  )

  var treeHasIgnoreAttribute = elementUtils.createTreeHasIgnoreAttribute(
    options.ignoreAttribute
  )

  var removeClickTracker = elementUtils.addEventListener(
    options.element,
    'click',
    clickTracker
  )

  instance._clickTrackingInstalled = true
  return disposable(function () {
    removeClickTracker()
    instance._clickTrackingInstalled = false
  })

  function clickTracker (e) {
    var target = elementUtils.findElement(elementUtils.getEventTarget(e))
    var navigationTimeoutId = null;
    var href = null;
    if (target && !treeHasIgnoreAttribute(target)) {
      if (
        options.delayAnchorClicks &&
        target.getAttribute('href') &&
        target.tagName.toLowerCase() === 'a'
      ) {
        href = target.getAttribute('href')
        /* Clicks on anchor links won't navigate away from the page, so don't
         * prevent the default behaviour. Setting `window.location.href` to an
         * anchor will add it as a hash to the url, so `_clickNavigationHandler`
         * can be called without a special case handler.
         */
        /* eslint-disable */
        if (href.trim().substr(0, 1) !== '#') {
          /*
           * `preventDefault` will prevent the browser from navigating away
           * before the logging event was send to the server. Not calling
           * `stopPropagation` allows other event handlers to fire (e.g. for
           * single page app routers)
           */
          e.preventDefault ? e.preventDefault() : (event.returnValue = false)
        }
        /* eslint-enable */
        navigationTimeoutId = setTimeout(function () {
          instance._clickNavigationHandler(href)
        }, options.delayAnchorClicks)
      }
      var elementData = elementUtils.getElementData(target)
      var data = options.extendClickData(e, elementData)

      /*
       * By continuing the navigation event right after success/failure of the
       * trackEvent call, the delay on reacting to the user action is minimized.
       *
       * However, should something go very wrong with the jsonp call and neither
       * success nor error callbacks are handled, the navigation should still
       * happen. That's what the `setTimeout` call above solves.
       *
       * If the jsonp does handle callbacks correctly, clear the timeout to
       * prevent a second call to `_clickNavigationHandler`.
       */
      var doNavigation = disposable(function doNavigation() {
        if (!navigationTimeoutId) {
          return;
        }
        clearTimeout(navigationTimeoutId)
        instance._clickNavigationHandler(href)
      })
      if (data) {
        instance.trackEvent(
            options.tableName,
            data,
            doNavigation,
            doNavigation
        )
      }
    }
  }
}

module.exports = {
  configure: configure,
  trackClicks: trackClicks
}
