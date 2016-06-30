var global = require('global')
var elementUtils = require('../utils/element')
var assign = require('../utils/lodash').assign
var forEach = require('../utils/lodash').forEach

module.exports = {
  configure: function () {
    this._clickTrackingInstalled = false
  },
  trackClicks: function (trackClicksOptions) {
    var document = global.document
    if (!document.body.addEventListener || this._clickTrackingInstalled) return

    var instance = this
    var options = assign({
      element: document.body,
      ignoreAttribute: 'td-ignore',
      onClick: function (event, data) {
        return data
      }
    }, trackClicksOptions)
    var treeHasIgnoreAttribute = elementUtils
      .createTreeHasIgnoreAttribute(options.ignoreAttribute)

    instance._clickTrackingInstalled = true
    options.element.addEventListener('click', clickTracker)
    return function removeClickTracker () {
      instance._clickTrackingInstalled = false
      options.element.removeEventListener('click', clickTracker)
    }

    function clickTracker (e) {
      var target = e.target
      if (
        !treeHasIgnoreAttribute(target) &&
        !elementUtils.shouldIgnoreElement(target)
      ) {
        var data = options.onClick(e, elementUtils.getElementData(target))
        if (data) {
          instance.trackEvent('clicks', data)
        }
      }
    }
  }
}
