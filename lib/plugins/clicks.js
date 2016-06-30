var global = require('global')
var elementUtils = require('../utils/element')
var assign = require('../utils/lodash').assign

module.exports = {
  configure: function () {
    this._clickTrackingInstalled = false
  },

  trackClicks: function (trackClicksOptions) {
    if (this._clickTrackingInstalled) return

    var instance = this
    var options = assign({
      element: global.document.body,
      ignoreAttribute: 'td-ignore',
      onClick: function (event, data) {
        return data
      }
    }, trackClicksOptions)
    var treeHasIgnoreAttribute = elementUtils
      .createTreeHasIgnoreAttribute(options.ignoreAttribute)
    var removeClickTracker = elementUtils
      .addEventListener(options.element, 'click', clickTracker)
    instance._clickTrackingInstalled = true
    return function () {
      removeClickTracker()
      instance._clickTrackingInstalled = false
    }

    function clickTracker (e) {
      var target = e.target || e.srcElement
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
}
