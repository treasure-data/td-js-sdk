var window = require('global/window')
var isFunction = require('../lib/lang').isFunction
var has = require('../lib/object').has
var addQueryParams = require('../lib/uri').addQueryParams
var noop = require('../lib/util').noop
var MAXIMUM_BODY_SIZE = 8192

function blobSupported () {
  try {
    var b = new window.Blob(['hi'])
    return b.size === 2
  } catch (e) {
    return false
  }
}

function canUse () {
  return has(window, ['navigator', 'sendBeacon']) && blobSupported()
}

// type PrepareParams = {
//   apiKey: string, callback?: (result: bolean) => void,
//   record: Object, url: string
// }
function prepare (params) {
  var data = JSON.stringify(params.record)
  var body = new window.Blob([data], { type: 'application/json' })
  var callback = isFunction(params.callback) ? params.callback : noop
  var url = addQueryParams(params.url, {
    api_key: params.apiKey
  })

  return {
    body: body,
    callback: callback,
    url: url
  }
}

// type SendParams = {
//   callback: (result: bolean) => void, body: Blob, url: string
// }
function send (params) {
  var callback = params.callback
  var body = params.body
  var url = params.url

  var result = window.navigator.sendBeacon(url, body)
  callback(result)
  return result
}

// type ValidateParams = { body: Blob }
function validate (params) {
  return params.body.size < MAXIMUM_BODY_SIZE
}

var beacon = {
  canUse: canUse,
  prepare: prepare,
  send: send,
  validate: validate
}

module.exports = beacon
