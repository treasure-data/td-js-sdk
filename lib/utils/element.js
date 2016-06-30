
var forEach = require('./lodash').forEach
var isString = require('./lodash').isString

function addEventListener (el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, handler)
    return function () {
      el.removeEventListener(type, handler)
    }
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, handler)
    return function () {
      el.detachEvent('on' + type, handler)
    }
  } else {
    throw new Error('addEventListener')
  }

  function handler (event) {
    var e = event || global.window.event
    return fn.call(el, e)
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

function createTreeHasIgnoreAttribute (ignoreAttribute) {
  return function treeHasIgnoreAttribute (el) {
    if (!el || el.tagName.toLowerCase() === 'html') {
      return false
    } else if (el.getAttribute(ignoreAttribute)) {
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
    var attr = el[attrName] || el.getAttribute(attr)
    if (attr) {
      data[attrName] = attr
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
      height > 1 &&
      len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN
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

module.exports = {
  addEventListener: addEventListener,
  createTreeHasIgnoreAttribute: createTreeHasIgnoreAttribute,
  getElementData: getElementData,
  htmlElementAsString: htmlElementAsString,
  htmlTreeAsString: htmlTreeAsString,
  shouldIgnoreElement: shouldIgnoreElement
}
