// (C) Treasure Data 2020
/* global XMLHttpRequest fetch */
var win = require('global/window')
var assign = require('./lodash').assign

var OK_STATUS = 200
var NOT_MODIFIED = 304

var defaultHeaders = {
  'Content-Type': 'application/json',
  'X-TD-Fetch-Api': 'true'
}

var SAME_ORIGIN = 'include'

function isValidStatus (status) {
  return (status >= OK_STATUS && status < 300) || status === NOT_MODIFIED
}

function toJSON (text) {
  var result
  try {
    result = JSON.parse(text)
  } catch (e) {
    result = {}
  }

  return result
}

function getHeaders (headers) {
  headers = headers || {}

  return assign({}, defaultHeaders, headers)
}

function isFetchSupported () {
  return 'fetch' in win
}

// Fetch API
function postWithFetch (url, body, options) {
  options = options || {}
  var headers = options.headers || {}

  return fetch(url, {
    method: 'POST',
    headers: getHeaders(headers),
    credentials: SAME_ORIGIN,
    body: JSON.stringify(body)
  }).then(function (response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response.json()
  })
}

function getWithFetch (url, options) {
  options = options || {}
  var headers = options.headers || {}

  return fetch(url, {
    headers: getHeaders(headers),
    credentials: SAME_ORIGIN
  })
    .then(function (response) {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })
}

function registerXhrEvents (xhr, resolve, reject) {
  xhr.onload = function onload () {
    if (isValidStatus(xhr.status)) {
      resolve(toJSON(xhr.responseText))
    } else {
      reject(new Error('Internal XMLHttpRequest error'))
    }
  }

  xhr.onerror = reject
}

function createXHR (method, url, options) {
  options = options || {}
  var headers = options.headers || {}

  var xhr = new XMLHttpRequest()
  xhr.open(method, url)

  xhr.withCredentials = true

  headers = getHeaders(options.headers)
  var headerKey
  for (headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }
  return xhr
}

module.exports = {
  post: function post (url, body, options) {
    if (isFetchSupported()) {
      return postWithFetch(url, body, options)
    }

    return new Promise(function (resolve, reject) {
      var xhr = createXHR('POST', url, options)
      registerXhrEvents(xhr, resolve, reject)
      xhr.send(JSON.stringify(body))
    })
  },

  get: function get (url, options) {
    if (isFetchSupported()) {
      return getWithFetch(url, options)
    }

    return new Promise(function (resolve, reject) {
      var xhr = createXHR('GET', url, options)
      registerXhrEvents(xhr, resolve, reject)
      xhr.send(null)
    })
  }
}
