var window = require('global/window')
var isFunction = require('../lib/isFunction')
var addQueryParams = require('../lib/uri').addQueryParams
var MAXIMUM_BODY_SIZE = 65536

function isAvailable () {
  try {
    return isFunction(window.navigator.sendBeacon) && (new window.Blob(['hi'])).size === 2
  } catch (err) {
    return false
  }
}

function send (requestParams) {
  var body = new window.Blob([JSON.stringify(requestParams.data, null, 2)], {
    type: 'application/json'
  })

  // var body = JSON.stringify(requestParams.data)
  console.log('body', body)

  var url = addQueryParams(requestParams.url, {
    api_key: requestParams.apiKey,
    modified: requestParams.modified
  })

  // body.size
  if (body.size >= MAXIMUM_BODY_SIZE) {
    requestParams.callback(new Error('body size'), false)
  } else {
    var result = window.navigator.sendBeacon(url, body)
    requestParams.callback(null, result)
  }
}

module.exports = {
  isAvailable: isAvailable,
  send: send
}
