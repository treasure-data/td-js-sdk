var window = require('global/window')
var utils = require('./utils')
// var cookies = require('js-cookie')
// cookies.get('foo')

var MAXIMUM_URL_LENGTH = 2084
var MAXIMUM_BODY_SIZE = 8192

var jsonp = {
  _base: 'TreasureJSONPCallback',
  _count: 0,
  send: function (url, body, callback) {
    var target = document.getElementsByTagName('head')[0]
    var id = jsonp._base + (jsonp._count++)
    var src = url + utils.paramSeparator(url) + utils.encode({callback: id})

    var timer = setTimeout(function () {
      cleanup()
      callback(new Error('timeout'))
    }, 10000)

    window[id] = function () {
      cleanup()
      callback(null)
    }

    function cleanup () {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      window[id] = utils.noop
      clearTimeout(timer)
    }

    var script = document.createElement('script')
    script.src = src
    target.parentNode.insertBefore(script, target)
    return true
  },
  isSuppoted: function () {
    var document = window.document
    return !!(
      document &&
      document.createElement &&
      document.getElementsByTagName('head')[0]
    )
  },
  isValid: function (url) {
    var id = jsonp._base + jsonp._count
    var src = url + utils.paramSeparator(url) + utils.encode({callback: id})
    return src.length < MAXIMUM_URL_LENGTH
  }
}

// function jsonpSupport () {
//   var document = window.document
//   return !!(document && document.createElement && document.head)
// }

// var checkSupport = {
//   xhr: function supportsXhr () {
//     return window.XMLHttpRequest && ('withCredentials' in (new window.XMLHttpRequest()))
//   },
//   beacon: function supportsBeacon () {
//     return window.navigator && window.navigator.sendBeacon && Blob
//   },
//   image: function supportsImage () {
//     return window.document && window.document.createElement
//   }
// }

// var jsonpCount = 0
// function jsonpTransport (url, body, callback) {
//   var document = window.document
//   if (!document || !document.createElement || !document.head) {
//     return false
//   }

//   var target = document.head
//   var id = 'TreasureJSONPCallback' + (jsonpCount++)
//   var paramSeparator = url.indexOf('?') === -1 ? '?' : '&'
//   var src = url + paramSeparator + utils.encode({callback: id})
//   if (src.length >= MAXIMUM_URL_LENGTH) {
//     return false
//   }

//   var timer = setTimeout(function () {
//     cleanup()
//     callback(new Error('timeout'))
//   }, 10000)

//   window[id] = function (data) {
//     cleanup()
//     callback(null, data)
//   }

//   function cleanup () {
//     if (script.parentNode) {
//       script.parentNode.removeChild(script)
//     }
//     window[id] = utils.noop
//     clearTimeout(timer)
//   }

//   var script = document.createElement('script')
//   script.src = src
//   target.parentNode.insertBefore(script, target)
//   return true
// }

var beacon = {
  send: function (url, body, callback) {
    var Blob = require('blob')
    var navigator = window.navigator

    // @TODO: Should I try to close() the blob after sending it?
    var blob = new Blob([body], {type: 'application/json'})
    var result = navigator.sendBeacon(url, blob)
    if (result) {
      callback(null)
    }
    return result
  },
  isSuppoted: function () {
    var navigator = window.navigator
    return !!(navigator && navigator.sendBeacon && require('blob'))
  },
  isValid: function (url, body) {
    return body.length < MAXIMUM_BODY_SIZE
  }
}

// function beacon (url, body, callback) {
//   var navigator = window.navigator
//   if (!navigator || !navigator.sendBeacon) {
//     return false
//   }

//   var Blob = require('blob')
//   if (!Blob) {
//     return false
//   }

//   // @TODO: Should I try to close() the blob after sending it?
//   var blob = new Blob([body], {type: 'application/json'})
//   var result = navigator.sendBeacon(url, blob)
//   if (result) {
//     callback()
//   }
//   return result
// }

// function image (url, callback) {
//   var document = window.document
//   if (!document || !document.createElement || url >= MAXIMUM_URL_LENGTH) {
//     return false
//   }
//   var img = document.createElement('img')
//   img.width = 1
//   img.height = 1
//   img.onload = imgCallback
//   img.onerror = imgCallback
//   img.src = url
//   // img.onload = img.onerror = function () {
//   //   img.onload = null
//   //   img.onerror = null
//   //   callback()
//   // }

//   function imgCallback () {
//     img.onload = null
//     img.onerror = null
//     callback()
//   }
// }

var xhr = {
  send: function (url, body, callback) {
    var request = new window.XMLHttpRequest()
    request.open('POST', url, true)
    request.withCredentials = true
    request.setRequestHeader('Content-Type', 'application/json')
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          callback(null)
        } else {
          callback(new Error(this.statusText))
        }
        request = null
      }
    }
    request.send(body)
    return true
  },
  isSupported: function () {
    var XMLHttpRequest = window.XMLHttpRequest
    return XMLHttpRequest && ('withCredentials' in (new XMLHttpRequest()))
  },
  isValid: function (url, body) {
    return body.length < MAXIMUM_BODY_SIZE
  }
}

// function xhr (url, body, callback) {
//   var XMLHttpRequest = window.XMLHttpRequest
//   if (!XMLHttpRequest) {
//     return false
//   }

//   var request = new XMLHttpRequest()
//   if (!('withCredentials' in request)) {
//     return false
//   }

//   request.open('POST', url, true)
//   request.withCredentials = true
//   request.setRequestHeader('Content-Type', 'application/json')
//   request.onreadystatechange = function onreadystatechange () {
//     if (this.readyState === 4) {
//       request = null
//       callback()
//     }
//   }
//   request.send(body)
//   return true
// }

module.exports = {
  transport: {
    beacon: beacon,
    jsonp: jsonp,
    xhr: xhr
  }

  // transport: {
  //   beacon: beacon,
  //   jsonp: jsonp,
  //   // image: image,
  //   xhr: xhr
  // }
}
