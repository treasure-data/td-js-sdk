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

var FETCH_CREDENTIALS = {
  'same-origin': 'same-origin',
  include: 'include',
  omit: 'omit'
}
var DEFAULT_CREDENTIALS = FETCH_CREDENTIALS.include

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

function getHeaders (headers, ignoreDefaultHeaders) {
  headers = headers || {}

  if (ignoreDefaultHeaders) {
    return assign({}, headers)
  }

  return assign({}, defaultHeaders, headers)
}

function isFetchSupported () {
  return 'fetch' in win
}

function isDefaultHeadersIgnored (options) {
  options = options || {}

  return options.ignoreDefaultHeaders || false
}

function getCredentials (options) {
  options = options || {}

  return FETCH_CREDENTIALS[options.credentials] || DEFAULT_CREDENTIALS
}

// Fetch API
function postWithFetch (url, body, options) {
  options = options || {}
  var headers = options.headers || {}

  return fetch(url, {
    method: 'POST',
    headers: getHeaders(headers, isDefaultHeadersIgnored(options)),
    credentials: getCredentials(options),
    body: JSON.stringify(body)
  }).then(function (response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response.text()
  })
    .then(function (text) {
      if (!text) return {}

      return JSON.parse(text)
    })
}

function getWithFetch (url, options) {
  options = options || {}
  var headers = options.headers || {}
  var method = options.method || 'GET'

  return fetch(url, {
    method: method,
    headers: getHeaders(headers, isDefaultHeadersIgnored(options)),
    credentials: getCredentials(options)
  })
    .then(function (response) {
      if (!response.ok) {
        throw Error(response.statusText)
      }

      return response.text()
    })
    .then(function (text) {
      if (!text) return {}

      return JSON.parse(text)
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

  xhr.withCredentials = Boolean(getCredentials(options))

  headers = getHeaders(options.headers, isDefaultHeadersIgnored(options))
  var headerKey
  for (headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }
  return xhr
}

function _timeout (milliseconds, promise, timeoutMessage) {
  var timerPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error(timeoutMessage || 'Operation Timeout'))
    }, milliseconds)
  })
  return Promise.race([timerPromise, promise])
}

function postWithTimeout (url, body, milliseconds, options) {
  if (window.AbortController) {
    var controller = new window.AbortController()

    var headers = getHeaders(options.headers, isDefaultHeadersIgnored(options))

    options.headers = headers

    var promise = window.fetch(url, Object.assign({}, options, {signal: controller.signal}))
    var timeoutId = setTimeout(function () {
      controller.abort()
    }, milliseconds)
    return promise['finally'](function () {
      clearTimeout(timeoutId)
    })
  } else {
    return _timeout(milliseconds, postWithFetch(url, body, options), 'Request Timeout')
  }
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
    options = options || {}

    if (isFetchSupported()) {
      return getWithFetch(url, options)
    }

    var method = options.method || 'GET'

    return new Promise(function (resolve, reject) {
      var xhr = createXHR(method, url, options)
      registerXhrEvents(xhr, resolve, reject)
      xhr.send(null)
    })
  },

  postWithTimeout: postWithTimeout
}
