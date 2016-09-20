var window = require('global/window')
var toBase64 = require('../lib/toBase64')
// var isFunction = require('../lib/isFunction')
var addQueryParams = require('../lib/uri').addQueryParams
var noop = require('../lib/noop')

var base = 'tdJSONPCallback'
var count = 0
var MAXIMUM_URL_LENGTH = 2084
var TIMEOUT = 5e3

function isAvailable () {
  try {
    // return isFunction(window.document.createElement)
    return !!window.document.createElement
  } catch (e) {
    return false
  }
}

function send (requestParams) {
  var callbackId = base + ++count
  var data = toBase64(JSON.stringify(requestParams.data))
  var target = window.document.getElementsByTagName('head')[0]
  var url = addQueryParams(requestParams.url, {
    api_key: requestParams.apiKey,
    callback: callbackId,
    data: data,
    modified: requestParams.modified
  })

  if (url >= MAXIMUM_URL_LENGTH) {
    requestParams.callback(new Error('url too long'), false)
  } else {
    window[callbackId] = function () {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      window[callbackId] = noop
      clearTimeout(timer)
      requestParams.callback(null, true)
    }

    var timer = setTimeout(function () {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      window[callbackId] = noop
      requestParams.callback(new Error('timeout'), false)
    }, TIMEOUT)

    var script = window.document.createElement('script')
    script.src = url
    target.parentNode.insertBefore(script, target)
  }
}

module.exports = {
  isAvailable: isAvailable,
  send: send
}
