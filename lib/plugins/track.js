/*!
* ----------------------
* Treasure Tracker
* ----------------------
*/

// Modules
var window = require('global/window')
var _ = require('../utils/lodash')
var cookie = require('../vendor/js-cookies')
var setCookie = require('../utils/setCookie')
var generateUUID = require('../utils/generateUUID')
var version = require('../version')
var document = window.document

// Helpers
function configureValues (track) {
  return _.assign(
    {
      td_version: function () {
        return version
      },
      td_client_id: function () {
        return track.uuid
      },
      td_charset: function () {
        return (document.characterSet || document.charset || '-').toLowerCase()
      },
      td_language: function () {
        var nav = window.navigator
        return (
          (nav && (nav.language || nav.browserLanguage)) ||
          '-'
        ).toLowerCase()
      },
      td_color: function () {
        return window.screen ? window.screen.colorDepth + '-bit' : '-'
      },
      td_screen: function () {
        return window.screen
          ? window.screen.width + 'x' + window.screen.height
          : '-'
      },
      td_viewport: function () {
        var clientHeight =
          document.documentElement && document.documentElement.clientHeight
        var clientWidth =
          document.documentElement && document.documentElement.clientWidth
        var innerHeight = window.innerHeight
        var innerWidth = window.innerWidth
        var height = clientHeight < innerHeight ? innerHeight : clientHeight
        var width = clientWidth < innerWidth ? innerWidth : clientWidth
        return width + 'x' + height
      },
      td_title: function () {
        return document.title
      },
      td_description: function () {
        return getMeta('description')
      },
      td_url: function () {
        return !document.location || !document.location.href
          ? ''
          : document.location.href.split('#')[0]
      },
      td_user_agent: function () {
        return window.navigator.userAgent
      },
      td_platform: function () {
        return window.navigator.platform
      },
      td_host: function () {
        return document.location.host
      },
      td_path: function () {
        return document.location.pathname
      },
      td_referrer: function () {
        return document.referrer
      },
      td_ip: function () {
        return 'td_ip'
      },
      td_browser: function () {
        return 'td_browser'
      },
      td_browser_version: function () {
        return 'td_browser_version'
      },
      td_os: function () {
        return 'td_os'
      },
      td_os_version: function () {
        return 'td_os_version'
      }
    },
    track.values
  )
}

function configureTrack (track) {
  return _.assign(
    {
      pageviews: 'pageviews',
      events: 'events',
      values: {}
    },
    track
  )
}

function configureStorage (storage) {
  if (storage === 'none') {
    return false
  }

  storage = _.isObject(storage) ? storage : {}

  return _.assign(
    {
      name: '_td',
      expires: 63072000,
      domain: document.location.hostname,
      customDomain: !!storage.domain,
      path: '/'
    },
    storage
  )
}

function getMeta (metaName) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var metas = head.getElementsByTagName('meta')
  var metaLength = metas.length
  for (var i = 0; i < metaLength; i++) {
    if (metas[i].getAttribute('name') === metaName) {
      return (metas[i].getAttribute('content') || '').substr(0, 8192)
    }
  }
  return ''
}

/**
 * Track#configure
 *
 * config (Object) - configuration object
 * config.storage (Object|String)
 *    - when object it will overwrite defaults
 * config.storage.name (String)
 *    - cookie name
 *    - defaults to _td
 * config.storage.expires (Number)
 *    - cookie duration in seconds
 *    - when 0 no cookie gets set
 *    - defaults to 63072000 (2 years)
 * config.storage.domain (String)
 *    - domain on which to set the cookie
 *    - defaults to document.location.hostname
 * config.track (Object)
 *    - tracking configuration object
 * config.track.pageviews (String)
 *    - default pageviews table name
 *    - defaults to 'pageviews'
 * config.track.events (String)
 *    - default events table name
 *    - defaults to 'events'
 *
 */
exports.configure = function configure (config) {
  config = _.isObject(config) ? config : {}

  // Object configuration for track and storage
  this.client.track = config.track = configureTrack(config.track)
  this.client.storage = config.storage = configureStorage(config.storage)

  // If clientId is not set, check cookies
  // If it's not set after checking cookies, generate a uuid and assign it
  if (_.isNumber(config.clientId)) {
    config.clientId = config.clientId.toString()
  } else if (!config.clientId || !_.isString(config.clientId)) {
    if (config.storage && config.storage.name) {
      config.clientId = cookie.getItem(config.storage.name)
    }
    if (!config.clientId || config.clientId === 'undefined') {
      config.clientId = generateUUID()
    }
  }

  this.resetUUID(config.storage, config.clientId)

  return this
}

/**
 * Track#resetUUID
 *
 * Resets the user's UUID
 */
exports.resetUUID = function resetUUID (suggestedStorage, suggestedClientId) {
  var clientId = suggestedClientId || generateUUID()
  var storage = suggestedStorage || this.client.storage
  // Remove any NULLs that might be present in the clientId
  this.client.track.uuid = clientId.replace(/\0/g, '')

  // Only save cookies if storage is enabled and expires is non-zero
  if (storage) {
    if (storage.expires) {
      setCookie(storage, storage.name, undefined)
      setCookie(storage, storage.name, this.client.track.uuid)
    }
  }

  // Values must be initialized later because they depend on knowing the uuid
  this.client.track.values = _.assign(
    configureValues(this.client.track),
    this.client.track.values
  )
  return this
}

/**
 * Track#trackEvent
 *
 * Like Treasure#addRecord, except that it'll include all track values
 *
 */
exports.trackEvent = function trackEvent (table, record, success, failure) {
  // When no table, use default events table
  if (!table) {
    table = this.client.track.events
  }

  record = _.assign(this.getTrackValues(), record)
  this.addRecord(table, record, success, failure)
  return this
}

/**
 * Track#trackPageview
 *
 * Track impressions on your website
 * Will include location, page, and title
 *
 * Usage:
 * Treasure#trackPageview() - Sets table to default track pageviews
 * Treasure#trackPageview(table, success, failure)
 *
 */
exports.trackPageview = function trackPageview (table, success, failure) {
  // When no table, use default pageviews table
  if (!table) {
    table = this.client.track.pageviews
  }

  this.trackEvent(table, {}, success, failure)
  return this
}

/**
 * Track#getTrackValues
 *
 * Returns an object which executes all track value functions
 *
 */
exports.getTrackValues = function getTrackValues () {
  var result = {}
  _.forIn(this.client.track.values, function (value, key) {
    if (value) {
      result[key] = typeof value === 'function' ? value() : value
    }
  })
  return result
}
