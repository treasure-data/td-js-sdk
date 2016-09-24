var window = require('global/window')
var forEach = require('./lib/forEach')
var getIn = require('./lib/getIn')
var version = require('./version')

// /** @const */
// var TrackerContext = require('./types').TrackerContext // eslint-disable-line no-unused-vars

// /** @const */
// var TrackerData = require('./types').TrackerData // eslint-disable-line no-unused-vars

/**
 * @nocollapse
 * @type {!TrackerContext}
 */
var context = {
  td_charset: function () {
    return getIn(window, 'document.characterSet') ||
      getIn(window, 'document.charset')
  },
  td_color: function () {
    return getIn(window, 'screen.colorDepth') + '-bit'
  },
  td_ip: function () {
    return 'td_ip'
  },
  td_language: function () {
    return (
      getIn(window, 'navigator.language') ||
      getIn(window, 'navigator.browserLanguage')
    ).toLowerCase()
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
    return width + 'x' + height
  },
  td_title: function () {
    return getIn(window, 'document.title')
  },
  td_url: function () {
    var hash = getIn(window, 'location.hash', '')
    return getIn(window, 'location.href', '').replace(hash, '')
  },
  td_user_agent: function () {
    return getIn(window, 'navigator.userAgent')
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
    return width + 'x' + height
  }
}

/** @return {!TrackerData} */
function getTrackerData () {
  var data = {}
  forEach(context, function (getValue, key, collection) {
    data[key] = getValue()
  })

  return data
}

module.exports = {
  context: context,
  getTrackerData: getTrackerData
}
