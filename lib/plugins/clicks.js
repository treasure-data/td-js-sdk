var global = require('global')
var elementUtils = require('../utils/element')
var assign = require('../utils/lodash').assign
var disposable = require('../utils/misc').disposable

function defaultOnClick (event, data) {
  return data
}

function configure () {
  this._clickTrackingInstalled = false
}

function trackClicks (trackClicksOptions) {
  if (this._clickTrackingInstalled) return

  var instance = this
  var options = assign({
    element: global.document,
    ignoreAttribute: 'td-ignore',
    onClick: defaultOnClick
  }, trackClicksOptions)

  var treeHasIgnoreAttribute = elementUtils
    .createTreeHasIgnoreAttribute(options.ignoreAttribute)

  var removeClickTracker = elementUtils
    .addEventListener(options.element, 'click', clickTracker)

  instance._clickTrackingInstalled = true
  return disposable(function () {
    removeClickTracker()
    instance._clickTrackingInstalled = false
  })

  function clickTracker (e) {
    var target = elementUtils.getEventTarget(e)
    if (
      !treeHasIgnoreAttribute(target) &&
      !elementUtils.shouldIgnoreElement(target)
    ) {
      var elementData = elementUtils.getElementData(target)
      var data = options.onClick(e, elementData)
      if (data) {
        instance.trackEvent('clicks', data)
      }
    }
  }
}

module.exports = {
  configure: configure,
  trackClicks: trackClicks
}
