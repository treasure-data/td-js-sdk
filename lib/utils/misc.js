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

function capitalizeFirstLetter (str) {
  var firstCodeUnit = str[0]

  if (firstCodeUnit < '\uD800' || firstCodeUnit > '\uDFFF') {
    return str[0].toUpperCase() + str.slice(1)
  }

  return str.slice(0, 2).toUpperCase() + str.slice(2)
}

function isLocalStorageAccessible () {
  var test = '__td__'
  try {
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

function camelCase (str) {
  if (!str) return

  return (str.toLowerCase().split(' ')).reduce((name, word, index) => {
    if (index === 0) {
      name += word
    } else {
      name += capitalizeFirstLetter(word)
    }

    return name
  }, '')
}

var adlHeaders = {
  'Content-Type': 'application/vnd.treasuredata.v1+json',
  'Accept': 'application/vnd.treasuredata.v1+json'
}

var globalIdAdlHeaders = {
  'Content-Type': 'application/vnd.treasuredata.v1.js+json',
  'Accept': 'application/vnd.treasuredata.v1.js+json'
}

module.exports = {
  disposable: disposable,
  invariant: invariant,
  fetchWithTimeout: fetchWithTimeout,
  camelCase: camelCase,
  isLocalStorageAccessible: isLocalStorageAccessible,
  adlHeaders: adlHeaders,
  globalIdAdlHeaders: globalIdAdlHeaders
}
