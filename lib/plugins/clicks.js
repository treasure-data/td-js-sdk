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
    if (target && !treeHasIgnoreAttribute(target)) {
      if (
        options.delayAnchorClicks &&
        target.getAttribute('href') &&
        target.tagName.toLowerCase() === 'a'
      ) {
        var href = target.getAttribute('href')
        /* eslint-disable */
        e.preventDefault ? e.preventDefault() : (event.returnValue = false)
        /* eslint-enable */
        e.stopPropagation && e.stopPropagation()
        setTimeout(function () {
          instance._clickNavigationHandler(href)
        }, options.delayAnchorClicks)
      }
      var elementData = elementUtils.getElementData(target)
      var data = options.extendClickData(e, elementData)
      if (data) {
        instance.trackEvent(options.tableName, data)
      }
    }
  }
}

module.exports = {
  configure: configure,
  trackClicks: trackClicks
}
