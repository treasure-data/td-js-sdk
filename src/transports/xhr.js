var window = require('global/window')
var addQueryParams = require('../lib/uri').addQueryParams
// var MAXIMUM_BODY_SIZE = 8192
var MAXIMUM_BODY_SIZE = 65536
var TIMEOUT = 5e3

function isAvailable () {
  try {
    return 'withCredentials' in (new window.XMLHttpRequest())
  } catch (e) {
    return false
  }
}

function send (requestParams) {
  var data = JSON.stringify(requestParams.data)
  var sync = requestParams.sync
  var url = addQueryParams(requestParams.url, {
    api_key: requestParams.apiKey,
    modified: requestParams.modified
  })

  if (data.length >= MAXIMUM_BODY_SIZE) {
    requestParams.callback(new Error('body too big'), false)
  } else {
    var request = new window.XMLHttpRequest()
    request.open('POST', url, !sync)
    // request.withCredentials = true
    request.setRequestHeader('Content-Type', 'application/json')
    // request.setRequestHeader('X-TD-Write-Key', params.apiKey)

    if (sync) {
      request.send(data)
      requestParams.callback(null, request.status === 200)
    } else {
      request.timeout = TIMEOUT
      request.onload = function onload () {
        if (request.readyState === 4) {
          requestParams.callback(null, request.status === 200)
          request.onload = request.ontimeout = null
        }
      }
      request.ontimeout = function ontimeout () {
        requestParams.callback(new Error('timeout'), false)
        request.onload = request.ontimeout = null
      }
      request.send(data)
    }
  }
}

module.exports = {
  isAvailable: isAvailable,
  send: send
}
