var window = require('global/window')
var toBase64 = require('../lib/toBase64')
var addQueryParams = require('../lib/addQueryParams')
var noop = require('../lib/noop')

// /** @const */
// var RequestParams = require('../types').RequestParams // eslint-disable-line no-unused-vars

// /** @const */
// var Transport = require('../types').Transport // eslint-disable-line no-unused-vars

/** @const {number} */
var MAXIMUM_URL_LENGTH = 2084

/** @const {number} */
var TIMEOUT = 5e3

/** @type {{base: string, count: number}} */
var config = {
  base: 'tdJSONPCallback',
  count: 0
}

/** @return {boolean} */
function isAvailable () {
  try {
    return !!(JSON.stringify && window.document.createElement('script'))
  } catch (e) {
    return false
  }
}

/** @param {!RequestParams} requestParams */
function send (requestParams) {
  var callbackId = config.base + ++config.count
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
      cleanup(script, callbackId)
      clearTimeout(timer)
      requestParams.callback(null, true)
    }

    var timer = setTimeout(function () {
      cleanup(script, callbackId)
      requestParams.callback(new Error('timeout'), false)
    }, TIMEOUT)

    var script = window.document.createElement('script')
    script.src = url
    target.parentNode.insertBefore(script, target)
  }
}

/**
 * @param {!Element} script
 * @param {string} callbackId
 */
function cleanup (script, callbackId) {
  if (script.parentNode) {
    script.parentNode.removeChild(script)
  }
  window[callbackId] = noop
}

/** @type {!Transport} */
module.exports = {
  config: config,
  isAvailable: isAvailable,
  name: 'jsonp',
  send: send
}

