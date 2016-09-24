var window = require('global/window')
var addQueryParams = require('../lib/addQueryParams')

// /** @const */
// var RequestParams = require('../types').RequestParams // eslint-disable-line no-unused-vars

// /** @const */
// var Transport = require('../types').Transport // eslint-disable-line no-unused-vars

/** @const {number} */
var MAXIMUM_BODY_SIZE = 65536

/** @return {boolean} */
function isAvailable () {
  try {
    return !!JSON.stringify &&
      !!window.navigator.sendBeacon &&
      (new window.Blob(['hi'])).size === 2
  } catch (err) {
    return false
  }
}

/** @param {!RequestParams} requestParams */
function send (requestParams) {
  var body = new window.Blob([JSON.stringify(requestParams.data)], {
    type: 'application/json'
  })
  var url = addQueryParams(requestParams.url, {
    api_key: requestParams.apiKey,
    modified: requestParams.modified
  })

  if (body.size >= MAXIMUM_BODY_SIZE) {
    requestParams.callback(new Error('body size'), false)
  } else {
    var result = window.navigator.sendBeacon(url, body)
    requestParams.callback(null, result)
  }
}

/** @type {!Transport} */
module.exports = {
  isAvailable: isAvailable,
  name: 'beacon',
  send: send
}
