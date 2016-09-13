var window = require('global/window')
var Cookies = require('js-cookie')
var assign = require('./lib/assign')
var trim = require('./lib/trim')
var forEach = require('./lib/forEach')
var uuid4 = require('./lib/uuid4')
var version = require('./version')
var getIn = require('./lib/getIn')

var trackerValues = {
  td_charset: function () {
    return getIn(window, 'document.characterSet') ||
      getIn(window, 'document.charset')
  },
  td_color: function () {
    var colorDepth = getIn(window, 'screen.colorDepth')
    if (colorDepth) {
      return colorDepth + '-bit'
    }
  },
  td_ip: function () {
    return 'td_ip'
  },
  td_language: function () {
    var language = (
      getIn(window, 'navigator.language') ||
      getIn(window, 'navigator.browserLanguage')
    )
    if (language) {
      return language.toLowerCase()
    }
  },
  td_platform: function () {
    return window.navigator.platform
  },
  td_referrer: function () {
    return getIn(window, 'document.referrer')
  },
  td_screen: function () {
    var width = getIn(window, 'screen.width')
    var height = getIn(window, 'screen.height')
    if (width && height) {
      return width + 'x' + height
    }
  },
  td_title: function () {
    return getIn(window, 'document.title')
  },
  td_user_agent: function () {
    return getIn(window, 'navigator.userAgent')
  },
  td_url: function () {
    return getIn(window, 'document.URL')
  },
  td_version: function () {
    return version
  },
  td_viewport: function () {
    var clientHeight = getIn(window, 'document.documentElement.clientHeight')
    var clientWidth = getIn(window, 'document.documentElement.clientWidth')
    var innerHeight = window.innerHeight
    var innerWidth = window.innerWidth
    var height = clientHeight < innerHeight ? innerHeight : clientHeight
    var width = clientWidth < innerWidth ? innerWidth : clientWidth
    if (height && width) {
      return width + 'x' + height
    }
  }
}

function createTracker (client) {
  var clientId = null
  var clientCookieInstalled = false
  client.getClientId = getClientId
  client.getTrackerValues = getTrackerValues
  client.installTrackerCookie = installTrackerCookie
  client.trackEvent = trackEvent
  client.trackPageview = trackPageview
  return client

  function getTrackerValues () {
    var values = {
      td_client_id: getClientId()
    }
    forEach(trackerValues, function (getValue, key) {
      values[key] = getValue()
    })
    return values
  }

  function trackEvent (tableName, values) {
    var eventsTable = tableName || client.config.eventsTable
    return client.addRecord(eventsTable, assign(getTrackerValues(), values))
  }

  function trackPageview (tableName) {
    var pageviewsTable = tableName || client.config.pageviewsTable
    return trackEvent(pageviewsTable, {})
  }

  function getClientId () {
    // Read clientId from config, cookie, or generate one
    // Make sure it's a string, remove null values, and trim it
    if (!clientId) {
      clientId = trim(
        client.config.clientId ||
        Cookies.get(client.config.cookieName) ||
        uuid4()
      ).replace(/\0/g, '')
    }
    return clientId
  }

  function installTrackerCookie () {
    // Don't do anything if cookies are disabled or it's already installed
    if (!getIn(window, 'navigator.cookieEnabled') || clientCookieInstalled) {
      return null
    }
    clientCookieInstalled = true

    var clientId = getClientId()
    var domainList = []
    if (client.config.cookieDomain) {
      domainList.push(client.config.cookieDomain)
    } else {
      var hostname = getIn(window, 'location.hostname', '')
      var split = hostname.split('.')
      var length = split.length
      var endsWithNumber = split[length - 1] === (parseInt(split[length - 1], 10) + '')
      if (length === 4 && endsWithNumber) {
        domainList.push('')
      } else {
        for (var index = length - 2; index >= 0; index--) {
          domainList.push(split.slice(index).join('.'))
        }
        domainList.push('')
      }
    }

    for (var i = 0; i < domainList.length; i++) {
      var tryDomain = domainList[i]
      Cookies.set(client.config.cookieName, clientId, {
        domain: tryDomain,
        expires: client.config.cookieExpiresDays,
        path: client.config.cookiePath
      })
      if (Cookies.get(client.config.cookieName) === clientId) {
        break
      }
    }
    return clientId
  }
}

module.exports = {
  createTracker: createTracker,
  trackerValues: trackerValues
}
