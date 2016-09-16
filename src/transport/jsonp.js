var window = require('global/window')
var toBase64 = require('../lib/toBase64')
var now = require('../lib/now')
var getIn = require('../lib/getIn')
var addQueryParams = require('../lib/uri').addQueryParams
var noop = require('../lib/noop')
var MAXIMUM_URL_LENGTH = 2084
var TIMEOUT = 5e3

// Check if environment allows JSONP requests
function canUse () {
  return !!getIn(window, 'document.createElement')
}

// Prepare params for JSONP request
// type PrepareParams = {
//   apiKey: string, callback?: (result: boolean) => void,
//   modified: number, data: Object, url: string
// }
function prepare (params) {
  jsonp._count = jsonp._count + 1

  var apiKey = params.apiKey
  var id = jsonp._base + jsonp._count
  var modified = now() // This is used to skip the cache
  var data = toBase64(JSON.stringify(params.data))
  var url = addQueryParams(params.url, {
    api_key: apiKey,
    callback: id,
    data: data,
    modified: modified
  })

  return {
    id: id,
    url: url
  }
}

// Send JSONPRequest
// type SendParams = {
//   callback: (result: boolean) => void, id: string, url: string
// }
function send (params) {
  var id = params.id
  var target = window.document.getElementsByTagName('head')[0]
  var url = params.url

  var timer = setTimeout(cleanup, TIMEOUT)
  window[id] = cleanup

  function cleanup () {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
    window[id] = noop
    clearTimeout(timer)
  }

  var script = window.document.createElement('script')
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
