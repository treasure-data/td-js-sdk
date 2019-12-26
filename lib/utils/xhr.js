// (C) Treasure Data 2019
/* global XMLHttpRequest XDomainRequest */

var JSON3 = require('json3')
var _ = require('./lodash')

var OK_STATUS = 200
var NO_CONTENT = 204
var NOT_MODIFIED = 304

// IE no-content status
var IE_NO_CONTENT = 1223

var defaultHeaders = {
  'Content-Type': 'application/json'
}

function isWithCredentials (xhr) {
  return 'withCredentials' in xhr
}

function getXMLHttpRequest () {
  return isWithCredentials(new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest
}

function createXHR (options, success, error) {
  success = success || _.noop
  error = error || _.noop
  options = options || {}

  if (!options.uri) {
    throw new Error('Endpoint missing')
  }

  var HttpRequestObject = getXMLHttpRequest()
  var xhr = new HttpRequestObject()
  var aborted = false
  var async = true
  var body = options.body || options.data

  function onload () {
    if (aborted) return

    var status
    var jsonReponse

    if (xhr.status === undefined) {
      status = OK_STATUS
    } else {
      status = xhr.status === IE_NO_CONTENT ? NO_CONTENT : xhr.status
    }

    if ((status >= OK_STATUS && status < 300) || status === NOT_MODIFIED) {
      jsonReponse = xhr.responseText ? JSON3.stringify(xhr.responseText) : {}
      success(jsonReponse)
    } else {
      error(new Error('Internal XMLHttpRequest error'))
    }
  }

  xhr.onreadystatechange = function onreadystatechange () {
    if (xhr.readyState === HttpRequestObject.DONE) {
      setTimeout(onload, 0)
    }
  }

  xhr.onload = onload

  xhr.onprogress = function () { }
  xhr.onerror = function onerror (err) {
    error(err)
  }

  xhr.onaborted = function onaborted () {
    aborted = true
  }

  if (isWithCredentials(xhr)) {
    xhr.open(options.method, options.uri, async)
  } else {
    xhr.open(options.method, options.uri)
  }

  if (options.headers && _.isObject(options.headers)) {
    var headers = _.assign(defaultHeaders, options.headers)

    _.forIn(headers, function (value, key) {
      xhr.setRequestHeader(key, value)
    })
  }

  if (isWithCredentials(xhr)) {
    xhr.withCredentials = Boolean(options.withCredentials)
  }

  xhr.send(body ? JSON3.stringify(body) : null)
}

module.exports = createXHR
