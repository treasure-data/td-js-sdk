var window = require('global/window')
var getIn = require('./lib/getIn')
var version = require('./version')

module.exports = {
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
    return getIn(window, 'navigator.platform')
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
    var hash = getIn(window, 'location.hash', '')
    return getIn(window, 'location.href', '').replace(hash, '')
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
