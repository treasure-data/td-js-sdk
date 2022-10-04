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
        var userAgent = window.navigator.userAgent
        var sdkUserAgent = 'JSSDK/' + version

        return [userAgent, sdkUserAgent].join(';')
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

/*
 * @Treasure.configure
 *
 * @description The configure function takes a config object that configures how the library will work.
 *
 * @param    {object}        config                 - configuration object
 * @property {object|string} config.storage         - when object it will overwrite defaults
 * @property {string}        config.storage.name    - cookie name, defaults to _td
 * @property {number}        config.storage.expires - cookie duration in seconds, when 0 no cookie gets set, defaults to 63072000 (2 years)
 * @property {string}        config.storage.domain  - domain on which to set the cookie, defaults to document.location.hostname
 * @property {object}        config.track           - tracking configuration object
 * @property {string}        config.track.pageviews - default pageviews table name, defaults to 'pageviews'
 * @property {string}        config.track.events    - default events table name, defaults to 'events'
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
 * Reset the client's UUID, set to Treasure Data as {@link TD_CLIENT_ID} `td_client_id`.
 * You can specify custom storage and custom client id.
 * See Track/Storage parameters section for more information on storage's configuration
 *
 * @param {object} [suggestedStorage]  - custom storage configuration
 * @param {string} [suggestedClientId] - custom client id
 *
 * @example
 * var td = new Treasure({...})
 * td.resetUUID() // set td_client_id as random uuid
 *
 * @example
 * var td = new Treasure({...})
 * td.resetUUID(
 *   {
 *     name: '_td', // cookie name
 *     expires: 63072000,
 *     domain: 'domain',
 *     customDomain: true/false
 *     path: '/'
 *   },
 *   'xxx-xxx-xxxx' // client id
 * )
 */
exports.resetUUID = function resetUUID (suggestedStorage, suggestedClientId) {
  var clientId = suggestedClientId || generateUUID()
  var storage = suggestedStorage || this.client.storage
  // Remove any NULLs that might be present in the clientId
  this.client.track.uuid = clientId.replace(/\0/g, '')

  // Only save cookies if storage is enabled and expires is non-zero
  // and client is in signed mode
  if (storage) {
    if (storage.expires && this.inSignedMode()) {
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
 * Creates an empty object, applies all tracked information values, and applies record values. Then it calls addRecord with the newly created object.
 *
 * @param {string}   table     - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
 * @param {string}   [record]  - Additional key-value pairs that get sent with the tracked values. These values overwrite default tracking values
 * @param {function} [success] - Callback for when sending the event is successful
 * @param {function} [failure] - Callback for when sending the event is unsuccessful
 *
 * @example
 * var td = new Treasure({...});
 *
 * td.trackEvent('events');
 * // Sends:
 * // {
 * //   "td_ip": "192.168.0.1",
 * //   ...
 * // }
 *
 *
 * td.trackEvent('events', {td_ip: '0.0.0.0'});
 * // Sends:
 * // {
 * //   "td_ip": "0.0.0.0",
 * //   ...
 * // }
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
 * Helper function that calls trackEvent with an empty record.
 * Track impressions on your website
 * Will include location, page, and title
 *
 * Usage:
 * Treasure#trackPageview() - Sets table to default track pageviews
 * Treasure#trackPageview(table, success, failure)
 *
 * @param {string}   table     - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
 * @param {function} [success] - Callback for when sending the event is successful
 * @param {function} [error]   - Callback for when sending the event is unsuccessful
 *
 *
 * @example
 * var td = new Treasure({...});
 * td.trackPageview('pageviews');
 */
exports.trackPageview = function trackPageview (table, success, failure) {
  // When no table, use default pageviews table
  if (!table) {
    table = this.client.track.pageviews
  }

  this.trackEvent(table, {}, success, failure)
  return this
}

/*
 * Track.getTrackValues
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

  if (!this.client.useNewJavaScriptEndpoint) {
    result['td_ip'] = 'td_ip'
    result['td_browser'] = 'td_browser'
    result['td_browser_version'] = 'td_browser_version'
    result['td_os'] = 'td_os'
    result['td_os_version'] = 'td_os_version'
  }
  return result
}
