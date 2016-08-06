var window = require('global/window')
var Cookies = require('js-cookie')
var utils = require('./utils')
var version = require('./version')

var document = window.document || {}
var documentElement = document.documentElement || {}
var location = document.location || {}
var navigator = window.navigator || {}
var screen = window.screen || {}

function formatResolution (width, height) {
  if (width && height) {
    return width + 'x' + height
  }
}

// These values can change between invocations
var changingValues = {
  td_path: function () {
    return location.pathname
  },
  td_screen: function () {
    return formatResolution(screen.width, screen.height)
  },
  td_title: function () {
    return document.title
  },
  td_url: function () {
    var url = location.href
    var idx = url.indexOf('#')
    return idx === -1 ? url : url.slice(0, idx)
  },
  td_viewport: function () {
    var clientHeight = documentElement.clientHeight
    var innerHeight = window.innerHeight
    var height = clientHeight < innerHeight ? innerHeight : clientHeight

    var clientWidth = documentElement.clientWidth
    var innerWidth = window.innerWidth
    var width = clientWidth < innerWidth ? innerWidth : clientWidth

    return formatResolution(width, height)
  }
}

// These values are constant, so their results can be cached
var constantValues = {
  td_charset: function () {
    return document.characterSet || document.charset
  },
  td_color: function () {
    if (screen.colorDepth) {
      return screen.colorDepth + '-bit'
    }
  },
  td_hostname: function () {
    var hostname = location.hostname + ''
    return hostname.indexOf('wwww.') === 0
      ? hostname.substring(4)
      : hostname
  },
  td_host: function () {
    return location.host
  },
  td_language: function () {
    var language = navigator.language || navigator.browserLanguage
    if (language) {
      return language.toLowerCase()
    }
  },
  td_referrer: function () {
    return document.referrer
  },
  td_ua: function () {
    return navigator.userAgent
  },
  td_browser: 'td_browser',
  td_browser_version: 'td_browser_version',
  td_ip: 'td_ip',
  td_os: 'td_os',
  td_os_version: 'td_os_version',
  td_version: version
}

function getTrackerValues (destination, values) {
  var result = {}
  utils.each(values, function (key, value) {
    result[key] = utils.isFunction(value)
      ? value()
      : value
  })
  return result
}

var defaultConfig = {
  disableLocalCookie: false,
  cookieDomain: null,
  cookieExpiresDays: 730, // 2 years
  cookieName: '_td',
  cookiePath: '/',
  eventsTable: 'events',
  pageviewsTable: 'pageviews'
}

function createTracker (trackerConfig) {
  var config = Object.assign({}, defaultConfig, trackerConfig)

  var clientId = cookieSetup(config)
  var trackerContext = getTrackerValues({ td_client_id: clientId }, constantValues)
  var tracker = {
    // clientId: clientId,
    // config: config,
    createTrackerEvent: createTrackerEvent,
    // trackEvent: trackEvent,
    // trackPageview: trackPageview,
    trackerContext: trackerContext
  }

  return tracker

  function createTrackerEvent (values) {
    return Object.assign(getTrackerValues({}, changingValues), trackerContext, values)
  }

  // function trackEvent (params) {
  //   var tableName = params.tableName || config.eventsTable
  //   return {
  //     tableName: tableName,
  //     values: createTrackerEvent(params.values)
  //   }
  // }

  // function trackPageview (params) {
  //   var tableName = params.tableName || config.pageviewsTable
  //   return {
  //     tableName: tableName,
  //     values: createTrackerEvent()
  //   }
  // }
}

function cookieSetup (config) {
  if (!navigator.cookieEnabled || config.disableLocalCookie) {
    return null
  }

  var clientId = getClientId(config)
  var domainList = []
  if (config.cookieDomain) {
    domainList.push(config.cookieDomain)
  } else {
    var domain = constantValues.td_hostname()
    var split = domain.split('.')
    var len = split.length
    var endsWithNumber = split[len - 1] === (parseInt(split[len - 1], 10) + '')

    // IPv4
    if (len === 4 && endsWithNumber) {
      domainList.push('')
    } else {
      for (var idx = len - 2; idx >= 0; idx--) {
        domainList.push(split.slice(idx).join('.'))
      }
      domainList.push('')
    }
  }

  // Keep trying to set the cookie with all the variations
  for (var i = 0; i < domainList.length; i++) {
    var tryDomain = domainList[i]
    Cookies.set(config.cookieName, clientId, {
      domain: tryDomain,
      expires: config.cookieExpiresDays,
      path: config.cookiePath
    })

    console.log(Cookies.get(config.cookieName))
    if (Cookies.get(config.cookieName) === clientId) {
      break
    }
  }

  return clientId
}

function getClientId (config) {
  var clientId = config.clientId || Cookies.get(config.cookieName) || utils.uuid4()

  // Strip null characters
  // Event collector sometimes gets null characters here
  return (clientId + '').replace(/\0/g, '')
}

module.exports = {
  changingValues: changingValues,
  constantValues: constantValues,
  createTracker: createTracker,
  getTrackerValues: getTrackerValues
}
