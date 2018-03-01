var forEach = require('./lodash').forEach
var isString = require('./lodash').isString
var disposable = require('./misc').disposable

// Info: http://www.quirksmode.org/js/events_properties.html
function getEventTarget (event) {
  // W3C says it's event.target, but IE8 uses event.srcElement
  var target = event.target || event.srcElement || window.document

  // If an event takes place on an element that contains text, this text node,
  // and not the element, becomes the target of the event
  return target.nodeType === 3 ? target.parentNode : target
}

function addEventListener (el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, handler, false)
    return disposable(function () {
      el.removeEventListener(type, handler, false)
    })
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, handler)
    return disposable(function () {
      el.detachEvent('on' + type, handler)
    })
  } else {
    throw new Error('addEventListener')
  }

  // IE8 doesn't pass an event param, grab it from the window if it's missing
  // Calls the real handler with the correct context, even if we don't use it
  function handler (event) {
    fn.call(el, event || window.event)
  }
}

function findElement (el) {
  if (!el || !el.tagName) {
    return null
  }
  for (var tag = el.tagName.toLowerCase(); tag && tag !== 'body'; (el = el.parentNode, tag = el && el.tagName && el.tagName.toLowerCase())) {
    var type = el.getAttribute('type')
    if (tag === 'input' && type === 'password') {
      return null
    }

    var role = el.getAttribute('role')
    if (
      role === 'button' ||
      role === 'link' ||
      tag === 'a' ||
      tag === 'button' ||
      tag === 'input'
    ) {
      return el
    }
  }

  return null
}

function createTreeHasIgnoreAttribute (ignoreAttribute) {
  var dataIgnoreAttribute = 'data-' + ignoreAttribute
  return function treeHasIgnoreAttribute (el) {
    if (!el || !el.tagName || el.tagName.toLowerCase() === 'html') {
      return false
    } else if (
      hasAttribute(el, ignoreAttribute) ||
      hasAttribute(el, dataIgnoreAttribute)
    ) {
      return true
    } else {
      return treeHasIgnoreAttribute(el.parentNode)
    }
  }
}

function getElementData (el) {
  var data = {
    tag: el.tagName.toLowerCase(),
    tree: htmlTreeAsString(el)
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
    if (hasAttribute(el, attrName)) {
      data[attrName] = el.getAttribute(attrName)
    }
  })

  return data
}

/**
 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @param elem
 * @returns {string}
 */
function htmlTreeAsString (elem) {
  var MAX_TRAVERSE_HEIGHT = 5
  var MAX_OUTPUT_LEN = 80
  var out = []
  var height = 0
  var len = 0
  var separator = ' > '
  var sepLength = separator.length
  var nextStr

  while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
    nextStr = htmlElementAsString(elem)
    // bail out if
    // - nextStr is the 'html' element
    // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
    //   (ignore this limit if we are on the first iteration)
    if (
      nextStr === 'html' ||
      (height > 1 &&
       len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN)
    ) {
      break
    }

    out.push(nextStr)

    len += nextStr.length
    elem = elem.parentNode
  }

  return out.reverse().join(separator)
}

/**
 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @param HTMLElement
 * @returns {string}
 */
function htmlElementAsString (elem) {
  var out = []
  var className
  var classes
  var key
  var attr
  var i

  if (!elem || !elem.tagName) {
    return ''
  }

  out.push(elem.tagName.toLowerCase())
  if (elem.id) {
    out.push('#' + elem.id)
  }

  className = elem.className
  if (className && isString(className)) {
    classes = className.split(' ')
    for (i = 0; i < classes.length; i++) {
      out.push('.' + classes[i])
    }
  }
  var attrWhitelist = ['type', 'name', 'title', 'alt']
  for (i = 0; i < attrWhitelist.length; i++) {
    key = attrWhitelist[i]
    attr = elem.getAttribute(key)
    if (attr) {
      out.push('[' + key + '="' + attr + '"]')
    }
  }
  return out.join('')
}

/* IE8 does NOT implement hasAttribute */
function hasAttribute (element, attrName) {
  if (typeof element.hasAttribute === 'function') {
    return element.hasAttribute(attrName)
  }
  return element.getAttribute(attrName) !== null
}

module.exports = {
  addEventListener: addEventListener,
  createTreeHasIgnoreAttribute: createTreeHasIgnoreAttribute,
  getElementData: getElementData,
  getEventTarget: getEventTarget,
  hasAttribute: hasAttribute,
  htmlElementAsString: htmlElementAsString,
  htmlTreeAsString: htmlTreeAsString,
  findElement: findElement
}
