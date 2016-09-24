var window = require('global/window')
var addQueryParams = require('../lib/addQueryParams')

// /** @const */
// var RequestParams = require('../types').RequestParams // eslint-disable-line no-unused-vars

// /** @const */
// var Transport = require('../types').Transport // eslint-disable-line no-unused-vars

/** @const {number} */
var TIMEOUT = 5e3

/** @return {boolean} */
function isAvailable () {
  try {
    return !!JSON.stringify &&
      ('withCredentials' in (new window.XMLHttpRequest()))
  } catch (e) {
    return false
  }
}

/** @param {!RequestParams} requestParams */
function send (requestParams) {
  var data = JSON.stringify(requestParams.data)
  var sync = requestParams.sync
  var url = addQueryParams(requestParams.url, {
    api_key: requestParams.apiKey,
    modified: requestParams.modified
  })

  var request = new window.XMLHttpRequest()
  request.open('POST', url, !sync)
  request.setRequestHeader('Content-Type', 'application/json')

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

/** @type {!Transport} */
module.exports = {
  isAvailable: isAvailable,
  name: 'xhr',
  send: send
}
