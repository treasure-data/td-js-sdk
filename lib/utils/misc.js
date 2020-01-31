function disposable (action) {
  var disposed = false
  return function dispose () {
    if (!disposed) {
      disposed = true
      action()
    }
  }
}

function invariant (conditon, text) {
  if (!conditon) {
    throw new Error(text)
  }
}

function noop () {}

function _timeout (milliseconds, promise, timeoutMessage) {
  var timerPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error(timeoutMessage || 'Operation Timeout'))
    }, milliseconds)
  })
  return Promise.race([timerPromise, promise])
}

function fetchWithTimeout (url, milliseconds, options) {
  if (window.AbortController) {
    var controller = new window.AbortController()
    var promise = window.fetch(url, Object.assign({}, options, {signal: controller.signal}))
    var timeoutId = setTimeout(function () {
      controller.abort()
    }, milliseconds)
    return promise['finally'](function () {
      clearTimeout(timeoutId)
    })
  } else {
    return _timeout(milliseconds, window.fetch(url, options), 'Request Timeout')
  }
}

function isSecureHTTP (protocol) {
  return /^https/.test(protocol)
}

module.exports = {
  disposable: disposable,
  invariant: invariant,
  noop: noop,
  fetchWithTimeout: fetchWithTimeout,
  isSecureHTTP: isSecureHTTP
}
