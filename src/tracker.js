var window = require('global/window')
var Cookies = require('js-cookie')
var isObject = require('./lib/lang').isObject
var object = require('./lib/object')
var trim = require('./lib/string').trim
var utils = require('./lib/utils')
var version = require('./version')
var assert = utils.assert
var assign = object.assign
var getIn = object.getIn
var uuid4 = utils.uuid4

var trackerValues = {
  td_path: function () {
    return getIn(window, 'location.pathname')
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
  td_url: function () {
    return getIn(window, 'location.href')
  },
  td_viewport: function () {
    var clientHeight = getIn(window, 'document.documentElement.clientHeight')
    var clientWidth = getIn(window, 'document.documentElement.clientWidth')

    var innerHeight = getIn(window, 'innerHeight')
    var innerWidth = getIn(window, 'innerWidth')

    var height = clientHeight < innerHeight ? innerHeight : clientHeight
    var width = clientWidth < innerWidth ? innerWidth : clientWidth

    if (height && width) {
      return width + 'x' + height
    }
  },
  td_charset: function () {
    return getIn(window, 'document.characterSet') || getIn(window, 'document.charset')
  },
  td_color: function () {
    var colorDepth = getIn(window, 'screen.colorDepth')
    if (colorDepth) {
      return colorDepth + '-bit'
    }
  },
  td_hostname: function () {
    var hostname = getIn(window, 'location.hostname')
    return hostname.indexOf('wwww.') === 0
      ? hostname.substring(4)
      : hostname
  },
  td_host: function () {
    return getIn(window, 'location.host')
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
  td_referrer: function () {
    return getIn(window, 'document.referrer')
  },
  td_ua: function () {
    return getIn(window, 'navigator.userAgent')
  },
  td_ip: function () {
    return 'td_ip'
  },
  td_version: function () {
    return version
  }
}

function createTracker (client) {
  var _clientId = null

  client._trackEventValues = _trackEventValues
  client._getClientId = _getClientId
  client.installLocalCookie = installLocalCookie
  return client

  function _trackEventValues (values) {
    assert(isObject(values), 'invalid values')
    return assign({}, values)
  }

  function _getClientId () {
    // Read clientId from config, cookie, or generate one
    // Make sure it's a string, remove null values, and trim it
    if (!_clientId) {
      _clientId = trim(
        client.config.clientId ||
        Cookies.get(client.config.cookieName) ||
        uuid4()
      ).replace(/\0/g, '')
    }
    return _clientId
  }

  function installLocalCookie () {
    var cookieEnabled = getIn(window, 'navigator.cookieEnabled')
    if (!cookieEnabled || client.config.disableLocalCookie) {
      return null
    }

    var clientId = client._getClientId()
    var domainList = []
    if (client.config.cookieDomain) {
      domainList.push(client.config.cookieDomain)
    } else {
      var locationHostname = getIn(window, 'location.hostname', '')
      var hostname = locationHostname.indexOf('wwww.') === 0
        ? locationHostname.substring(4)
        : locationHostname

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
      Cookies.set(client.config.cookieName, client._getClientId(), {
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
  createTracker,
  trackerValues
}
