var window = require('global/window')
var getIn = require('../lib/getIn')
var addQueryParams = require('../lib/uri').addQueryParams
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
  return !!getIn(window, 'navigator.sendBeacon') && blobSupported()
}

function prepare (params) {
  var data = JSON.stringify(params.data)
  var body = new window.Blob([data], { type: 'application/json' })
  var url = addQueryParams(params.url, {
    api_key: params.apiKey
  })

  return {
    body: body,
    url: url
  }
}

function send (params) {
  return window.navigator.sendBeacon(params.url, params.body)
}

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
