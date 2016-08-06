/**
 * Utils for working with older browsers without losing your sanity
 * A couple of the utils are from raven-js
 */
var window = require('global/window')
var assign = require('object.assign').getPolyfill()
var objectPrototype = Object.prototype
var hasOwnProperty = objectPrototype.hasOwnProperty
var toString = objectPrototype.toString

var base64 = require('./base64')

var isArray = Array.isArray || function isArray (arg) {
  return toString.call(arg) === '[object Array]'
}

function noop () {}

function assert (value, message) {
  if (!value) {
    throw new Error(message)
  }
}

function isUndefined (value) {
  return value === void 0
}

function isFunction (value) {
  return typeof value === 'function'
}

function isString (value) {
  return toString.call(value) === '[object String]'
}

function isObject (value) {
  return typeof value === 'object' && value !== null
}

function stripWhitespace (value) {
  return value ? value.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '') : ''
}

function each (obj, callback) {
  // if (!isObject(obj)) {
  //   throw new TypeError(obj + ' is not an object or array')
  // }
  // if (!isFunction(callback)) {
  //   throw new TypeError(callback + ' is not a function')
  // }

  if (isUndefined(obj.length)) {
    for (var key in obj) {
      if (hasKey(obj, key)) {
        (0, callback)(key, obj[key])
      }
    }
  } else if (obj.length) {
    for (var idx = 0, len = obj.length; idx < len; idx++) {
      (0, callback)(idx, obj[idx])
    }
  }

  // var i
  // var j
  // if (isUndefined(obj.length)) {
  //   for (i in obj) {
  //     if (hasKey(obj, i)) {
  //       (0, callback)(i, obj[i])
  //       // callback(i, obj[i])
  //       // callback.call(null, i, obj[i])
  //     }
  //   }
  // } else {
  //   j = obj.length
  //   if (j) {
  //     for (i = 0; i < j; i++) {
  //       (0, callback)(i, obj[i])
  //       // callback(i, obj[i])
  //       // callback.call(null, i, obj[i])
  //     }
  //   }
  // }
}

/**
 * hasKey, a better form of hasOwnProperty
 * Example: hasKey(MainHostObject, property) === true/false
 *
 * @param {Object} host object to check property
 * @param {string} key to check
 */
function hasKey (object, key) {
  // objectPrototype.
  return hasOwnProperty.call(object, key)
}

// Older browsers don't support Date.now()
var now = Date.now || function now () {
  return +new Date()
}

function urlencode (o) {
  var pairs = []
  each(o, function (key, value) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })
  return pairs.join('&')
}

// borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
// intentionally using regex and not <a/> href parsing trick because React Native and other
// environments where DOM might not be available
function parseUrl (url) {
  var match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/)
  if (!match) return {}

  // coerce to undefined values to empty string so we don't get 'undefined'
  var query = match[6] || ''
  var fragment = match[8] || ''
  return {
    protocol: match[2],
    host: match[4],
    path: match[5],
    relative: match[5] + query + fragment // everything minus origin
  }
}

function paramSeparator (url) {
  return url.indexOf('?') === -1 ? '?' : '&'
}

// node-uuid doesn't work with old IE
// Source: http://stackoverflow.com/a/8809472
// function uuid () {
//   var d = now()
//   if (window.performance && typeof window.performance.now === 'function') {
//     d += window.performance.now() // use high-precision timer if available
//   }
//   var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//     var r = (d + Math.random() * 16) % 16 | 0
//     d = Math.floor(d / 16)
//     return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
//   })
//   return u
// }
function uuid4 () {
  var crypto = window.crypto || window.msCrypto

  if (!isUndefined(crypto) && crypto.getRandomValues) {
    // Use window.crypto API if available
    var arr = new Uint16Array(8)
    crypto.getRandomValues(arr)

    // set 4 in byte 7
    arr[3] = arr[3] & 0xFFF | 0x4000
    // set 2 most significant bits of byte 9 to '10'
    arr[4] = arr[4] & 0x3FFF | 0x8000

    var pad = function (num) {
      var v = num.toString(16)
      while (v.length < 4) {
        v = '0' + v
      }
      return v
    }

    return pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) +
    pad(arr[5]) + pad(arr[6]) + pad(arr[7])
  } else {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0
      var v = c === 'x' ? r : r & 0x3 | 0x8
      return v.toString(16)
    })
  }
}

// /**
//  * Given a child DOM element, returns a query-selector statement describing that
//  * and its ancestors
//  * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
//  * @param elem
//  * @returns {string}
//  */
// function htmlTreeAsString (elem) {
//   var MAX_TRAVERSE_HEIGHT = 5
//   var MAX_OUTPUT_LEN = 80
//   var out = []
//   var height = 0
//   var len = 0
//   var separator = ' > '
//   var sepLength = separator.length
//   var nextStr

//   while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
//     nextStr = htmlElementAsString(elem)
//     // bail out if
//     // - nextStr is the 'html' element
//     // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
//     //   (ignore this limit if we are on the first iteration)
//     if (nextStr === 'html' || height > 1 && len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN) {
//       break
//     }

//     out.push(nextStr)

//     len += nextStr.length
//     elem = elem.parentNode
//   }

//   return out.reverse().join(separator)
// }

// /**
//  * Returns a simple, query-selector representation of a DOM element
//  * e.g. [HTMLElement] => input#foo.btn[name=baz]
//  * @param HTMLElement
//  * @returns {string}
//  */
// function htmlElementAsString (elem) {
//   var out = []
//   var className
//   var classes
//   var key
//   var attr
//   var i

//   if (!elem || !elem.tagName) {
//     return ''
//   }

//   out.push(elem.tagName.toLowerCase())
//   if (elem.id) {
//     out.push('#' + elem.id)
//   }

//   className = elem.className
//   if (className && isString(className)) {
//     classes = className.split(' ')
//     for (i = 0; i < classes.length; i++) {
//       out.push('.' + classes[i])
//     }
//   }
//   var attrWhitelist = ['type', 'name', 'title', 'alt']
//   for (i = 0; i < attrWhitelist.length; i++) {
//     key = attrWhitelist[i]
//     attr = elem.getAttribute(key)
//     if (attr) {
//       out.push('[' + key + '="' + attr + '"]')
//     }
//   }
//   return out.join('')
// }

// The first param is an object where each value is a function that returns
// the input's validity as a boolean. The second param is the object that will
// get tested.
function validate (validators, obj) {
  each(validators, function checkValidity (name, test) {
    assert(hasKey(obj, name) && test(obj[name]), 'invalid ' + name)
  })
}

// If it can be used as a valid database or table name
function isResourceName (resource) {
  return isString(resource) && /^[a-z0-9_]{3,255}$/.test(resource)
}

module.exports = {
  // htmlElementAsString: htmlElementAsString,
  // htmlTreeAsString: htmlTreeAsString,
  assert: assert,
  assign: assign,
  base64: base64,
  each: each,
  hasKey: hasKey,
  isArray: isArray,
  isFunction: isFunction,
  isObject: isObject,
  isResourceName: isResourceName,
  isString: isString,
  noop: noop,
  now: now,
  paramSeparator: paramSeparator,
  parseUrl: parseUrl,
  stripWhitespace: stripWhitespace,
  urlencode: urlencode,
  uuid4: uuid4,
  validate: validate
}
