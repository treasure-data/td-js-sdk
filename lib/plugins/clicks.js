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
      onClick: defaultOnClick,
      element: document.body
    }, trackClicksOptions)

    instance._clickTrackingInstalled = true
    options.element.addEventListener('click', clickTracker)
    return function remoteClickTracker () {
      instance._clickTrackingInstalled = false
      options.element.removeEventListener('click', clickTracker)
    }

    function clickTracker (e) {
      var target = e.target
      if (
        !treeHasIgnoreAttribute(target) &&
        !shouldIgnoreElement(target)
      ) {
        var data = options.onClick(e, getElementData(target))
        if (data) {
          instance.trackEvent('clicks', data)
        }
      }
    }
  }
}

function defaultOnClick (event, data) {
  return data
}

function getElementData (el) {
  var data = {
    tag: el.tagName.toLowerCase(),
    tree: elementUtils.htmlTreeAsString(el)
  }

  forEach([
    'alt',
    'class',
    'href',
    'id',
    'name',
    'role',
    'title',
    'type'
  ], function (attrName) {
    var attr = el[attrName] || el.getAttribute(attr)
    if (attr) {
      data[attrName] = attr
    }
  })

  return data
}

var ignoreAttribute = 'td-ignore'
function treeHasIgnoreAttribute (el) {
  if (!el || el.tagName.toLowerCase() === 'html') {
    return false
  } else if (el.getAttribute(ignoreAttribute)) {
    return true
  } else {
    return treeHasIgnoreAttribute(el.parentNode)
  }
}

function shouldIgnoreElement (el) {
  var tag = el.tagName.toLowerCase()
  var type = el.getAttribute('type')
  if (tag === 'input' && type === 'password') {
    return true
  }

  var role = el.getAttribute('role')
  if (
    role === 'button' ||
    role === 'link' ||
    tag === 'a' ||
    tag === 'button' ||
    tag === 'input'
  ) {
    return false
  }

  return true
}
