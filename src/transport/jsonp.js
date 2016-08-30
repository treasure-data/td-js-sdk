var window = require('global/window')
var encode = require('../lib/base64').encode
var now = require('../lib/date').now
// var isFunction = require('../lib/lang').isFunction
var hasIn = require('../lib/object').hasIn
var addQueryParams = require('../lib/uri').addQueryParams
var noop = require('../lib/util').noop
var MAXIMUM_URL_LENGTH = 2084
var TIMEOUT = 5e3

// Check if environment allows JSONP requests
function canUse () {
  return hasIn(window, 'document.createElement')
}

// Prepare params for JSONP request
// type PrepareParams = {
//   apiKey: string, callback?: (result: boolean) => void,
//   modified: number, data: Object, url: string
// }
function prepare (params) {
  jsonp._count = jsonp._count + 1

  var apiKey = params.apiKey
  // var callback = isFunction(params.callback) ? params.callback : noop
  var id = jsonp._base + jsonp._count
  var modified = now() // This is used to skip the cache
  var data = encode(JSON.stringify(params.data))
  var url = addQueryParams(params.url, {
    api_key: apiKey,
    callback: id,
    data: data,
    modified: modified
  })

  return {
    // callback: callback,
    id: id,
    url: url
  }
}

// Send JSONPRequest
// type SendParams = {
//   callback: (result: boolean) => void, id: string, url: string
// }
function send (params) {
  // var callback = params.callback
  var id = params.id
  var target = window.document.getElementsByTagName('head')[0]
  var url = params.url

  var timer = setTimeout(function jsonpTimeout () {
    cleanup()
    // callback(false)
  }, TIMEOUT)

  window[id] = function jsonpCallback () {
    cleanup()
    // callback(true)
  }

  function cleanup () {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
    window[id] = noop
    clearTimeout(timer)
  }

  var script = document.createElement('script')
  script.src = url
  target.parentNode.insertBefore(script, target)
  return true
}

// Confirm prepared JSONP request object is valid
// type ValidateParams = { url: string }
function validate (params) {
  return params.url.length < MAXIMUM_URL_LENGTH
}

var jsonp = {
  _base: 'tdJSONPCallback',
  _count: 0,
  canUse: canUse,
  prepare: prepare,
  send: send,
  validate: validate
}

module.exports = jsonp
