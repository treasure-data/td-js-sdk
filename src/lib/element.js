var window = require('global/window')
var forEach = require('./forEach')
var once = require('./once')
var trim = require('./trim')

/**
 * @param {EventTarget} element
 * @param {string} type
 * @param {Function} fn
 * @return {Function}
 */
function addEventListener (element, type, fn) {
  if (element.addEventListener) {
    element.addEventListener(type, handler, false)
    return once(function disposeEventListener () {
      element.removeEventListener(type, handler, false)
    })
  } else if (element.attachEvent) {
    element.attachEvent('on' + type, handler)
    return once(function disposeEventListener () {
      element.detachEvent('on' + type, handler)
    })
  } else {
    throw new Error('unexpected environment')
  }

  /**
   * IE8 doesn't pass an event param, grab it from the window if it's missing
   * Calls the real handler with the correct context, even if we don't use it
   * @param {Event} event
   */
  function handler (event) {
    fn.call(element, event || window.event)
  }
}

/**
 * Info: http://www.quirksmode.org/js/events_properties.html
 * @param {Event} event
 * @return {EventTarget}
 */
function getEventTarget (event) {
  // W3C says it's event.target, but IE8 uses event.srcElement
  var target = event.target || event.srcElement || window.document

  // If an event takes place on an element that contains text, this text node,
  // and not the element, becomes the target of the event
  return target.nodeType === 3 ? target.parentNode : target
}

/**
 * @param {!(HTMLElement|Element)} element
 * @return {Object<string, *>}
 */
function getElementData (element) {
  var data = {
    tag: element.tagName.toLowerCase(),
    tree: htmlTreeAsString(element)
  }

  var attrList = [
    'alt',
    'class',
    'href',
    'id',
    'name',
    'role',
    'title',
    'type'
  ]

  forEach(attrList, function (attrName) {
    if (element.hasAttribute(attrName)) {
      data[attrName] = element.getAttribute(attrName)
    }
  })

  return data
}

/**
 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @param {!(HTMLElement|Element)} element
 * @return {string}
 */
function htmlElementAsString (element) {
  if (!element || !element.tagName) {
    return ''
  }

  var out = []
  out.push(element.tagName.toLowerCase())
  if (element.id) {
    out.push('#' + element.id)
  }

  var className = trim(element.getAttribute('class') || '')
  if (className) {
    var classes = className.split(/\s+/)
    forEach(classes, function (classItem) {
      out.push('.' + classItem)
    })
  }

  var attrWhitelist = ['type', 'name', 'title', 'alt']
  forEach(attrWhitelist, function (attr) {
    if (element.hasAttribute(attr)) {
      out.push('[' + attr + '="' + element.getAttribute(attr) + '"]')
    }
  })

  return out.join('')
}

/**
 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @param {?(HTMLElement|Element)} element
 * @return {string}
 */
function htmlTreeAsString (element) {
  var MAX_TRAVERSE_HEIGHT = 5
  var MAX_OUTPUT_LEN = 80
  var out = []
  var height = 0
  var len = 0
  var separator = ' > '
  var sepLength = separator.length
  var nextStr

  while (element && height++ < MAX_TRAVERSE_HEIGHT) {
    nextStr = htmlElementAsString(element)
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
    element = element.parentNode
  }

  return out.reverse().join(separator)
}

/**
 * @param {!(HTMLElement|Element)} element
 * @return {boolean}
 */
function shouldIgnoreElement (element) {
  if (!element || !element.tagName) {
    return true
  }

  var tag = element.tagName.toLowerCase()
  var type = element.getAttribute('type')
  if (tag === 'input' || type === 'password') {
    return true
  }

  var role = element.getAttribute('role')
  return !/^(button|link)$/.test(role) && !/^(a|button|input)$/.test(tag)
}

/**
 * @param {string} ignoreAttribute
 * @param {!(HTMLElement|Element)} element
 * @return {boolean}
 */
function treeHasIgnoreAttribute (ignoreAttribute, element) {
  var dataIgnoreAttribute = 'data-' + ignoreAttribute
  return innerTreeHasIgnoreAttribute(element)

  function innerTreeHasIgnoreAttribute (el) {
    if (
      el.hasAttribute(ignoreAttribute) ||
      el.hasAttribute(dataIgnoreAttribute)
    ) {
      return true
    } else {
      var parentNode = el.parentNode
      if (!parentNode || !parentNode.tagName || parentNode.tagName.toLowerCase() === 'html') {
        return false
      } else {
        return innerTreeHasIgnoreAttribute(parentNode)
      }
    }
  }
}

module.exports = {
  addEventListener: addEventListener,
  getElementData: getElementData,
  getEventTarget: getEventTarget,
  htmlElementAsString: htmlElementAsString,
  shouldIgnoreElement: shouldIgnoreElement,
  treeHasIgnoreAttribute: treeHasIgnoreAttribute
}
