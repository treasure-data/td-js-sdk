var window = require('global/window')
var MAXIMUM_BODY_SIZE = 8192
var TIMEOUT = 5e3

// Check if CORS XHR requests are allowed
function canUse () {
  var XMLHttpRequest = window.XMLHttpRequest
  return !!(XMLHttpRequest && ('withCredentials' in (new XMLHttpRequest())))
}

// Prepare params for CORS XHR request
function prepare (params) {
  var apiKey = params.apiKey
  var data = JSON.stringify(params.data)
  var sync = params.sync === true
  var url = params.url

  return {
    apiKey: apiKey,
    // callback: callback,
    data: data,
    sync: sync,
    url: url
  }
}

// Helper for shared behavior between async and sync
function createRequest (params) {
  var request = new window.XMLHttpRequest()
  request.open('POST', params.url, !params.sync)
  request.withCredentials = true
  request.setRequestHeader('Content-Type', 'application/json')
  request.setRequestHeader('X-TD-Write-Key', params.apiKey)
  return request
}

// Send an async CORS XHR request
function sendAsync (params) {
  var request = createRequest(params)
  request.timeout = TIMEOUT
  request.onload = function onload () {
    if (request.readyState === 4) {
      request.onload = null
      request.ontimeout = null
      request = null
    }
  }
  request.ontimeout = function ontimeout () {
    request.onload = null
    request.ontimeout = null
    request = null
  }
  request.send(params.data)
  return true
}

// Send a sync CORS XHR request
function sendSync (params) {
  var request = createRequest(params)
  request.send(params.data)
  return request.status === 200
}

// Send a CORS XHR request
// type SendParams = {
//   apiKey: string, data: string, sync: boolean, url: string
// }
function send (params) {
  return params.sync ? sendSync(params) : sendAsync(params)
}

// Confirm prepared XHR request object is valid
// type ValidateParams = { data: string }
function validate (params) {
  return params.data.length < MAXIMUM_BODY_SIZE
}

var xhr = {
  canUse: canUse,
  prepare: prepare,
  send: send,
  validate: validate
}

module.exports = xhr
