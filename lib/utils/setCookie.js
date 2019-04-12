var cookie = require('../vendor/js-cookies')
var _ = require('../utils/lodash')

function findDomains (domain) {
  var domainChunks = domain.split('.')
  var domains = []
  for (var i = domainChunks.length - 1; i >= 0; i--) {
    domains.push(domainChunks.slice(i).join('.'))
  }
  return domains
}

// Set cookie on highest allowed domain
function setCookieByCookie (storage, name, value) {
  var clone = _.assign({}, storage)
  var is = {
    ip: storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
    local: storage.domain === 'localhost',
    custom: storage.customDomain
  }
  var expires = new Date()
  expires.setSeconds(expires.getSeconds() + clone.expires)

  // When it's localhost, an IP, or custom domain, set the cookie directly
  if (is.ip || is.local || is.custom) {
    clone.domain = is.local ? null : clone.domain
    cookie.setItem(name, value, expires, clone.path, clone.domain)
  } else {
    // Otherwise iterate recursively on the domain until it gets set
    // For example, if we have three sites:
    // bar.foo.com, baz.foo.com, foo.com
    // First it tries setting a cookie on .com, and it fails
    // Then it sets the cookie on foo.com, and it'll pass
    var domains = findDomains(storage.domain)
    var ll = domains.length
    var i = 0
    // Check cookie to see if it's "undefined".  If it is, remove it
    if (!value) {
      for (; i < ll; i++) {
        cookie.removeItem(name, storage.path, domains[i])
      }
    } else {
      for (; i < ll; i++) {
        clone.domain = domains[i]
        cookie.setItem(name, value, expires, clone.path, clone.domain)

        // Break when cookies aren't being cleared and it gets set properly
        // Don't break when value is falsy so all the cookies get cleared
        if (cookie.getItem(name) === value) {
          // When cookie is set succesfully, save used domain in storage object
          storage.domain = clone.domain
          break
        }
      }
    }
  }
}

// Set cookie with Local Storage
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
function setCookieByLocalStorage (name, value) {
  window.localStorage.setItem(name, value)
}

function getCookieFromLocalStorage (name) {
  return window.localStorage.getItem(name)
}

function mayNeedLocalStorage () {
  return (
    window.navigator.appVersion.indexOf('KHTML') > 0 &&
    window.navigator.appVersion.indexOf('Chrome') === -1
  )
}

var setCookie = {
  setCookie: function setCookie (storage, name, value) {
    if (mayNeedLocalStorage() && !storage.disableLocalStorage) {
      setCookieByLocalStorage(name, value)
    }
    setCookieByCookie(storage, name, value)
  },
  getCookie: function getCookie (storage, name) {
    if (mayNeedLocalStorage() && !storage.disableLocalStorage) {
      var value = getCookieFromLocalStorage(name)
      if (value) {
        return value
      }
    }
    return cookie.getItem(name)
  }
}

module.exports = setCookie
