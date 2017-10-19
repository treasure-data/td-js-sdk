/*!
* ----------------------
* Treasure Tracker
* ----------------------
*/

// Modules
var window = require('global/window')
var _ = require('../utils/lodash')
var cookie = require('../vendor/js-cookies')
var generateUUID = require('../utils/generateUUID')
var version = require('../version')
var document = window.document

// Helpers
function configureValues (track) {
  return _.assign({
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
      return (nav && (nav.language || nav.browserLanguage) || '-').toLowerCase()
    },
    td_color: function () {
      return window.screen ? window.screen.colorDepth + '-bit' : '-'
    },
    td_screen: function () {
      return window.screen ? window.screen.width + 'x' + window.screen.height : '-'
    },
    td_viewport: function () {
      var clientHeight = document.documentElement && document.documentElement.clientHeight
      var clientWidth = document.documentElement && document.documentElement.clientWidth
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
      return document.location.href.split('#')[0]
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
  }, track.values)
}

function configureTrack (track) {
  return _.assign({
    pageviews: 'pageviews',
    events: 'events',
    values: {}
  }, track)
}

function configureStorage (storage) {
  if (storage === 'none') {
    return false
  }

  storage = _.isObject(storage) ? storage : {}

  return _.assign({
    name: '_td',
    expires: 63072000,
    domain: document.location.hostname,
    customDomain: !!storage.domain,
    path: '/'
  }, storage)
}

function findDomains (domain) {
  var domainChunks = domain.split('.')
  var domains = []
  for (var i = domainChunks.length - 1; i >= 0; i--) {
    domains.push(domainChunks.slice(i).join('.'))
  }
  return domains
}

function getMeta (metaName) {
  var metas = document.head.getElementsByTagName('meta')
  var metaLength = metas.length
  for (var i = 0; i < metaLength; i++) {
    if (metas[i].getAttribute('name') === metaName) {
      return metas[i].getAttribute('content').substr(0, 8192)
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

  // Remove any NULLs that might be present in the clientId
  this.client.track.uuid = config.clientId.replace(/\0/g, '')

  // Set cookie on highest allowed domain
  var setCookie = function (storage, uuid) {
    var clone = _.assign({}, storage)
    var is = {
      ip: storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
      local: storage.domain === 'localhost',
      custom: storage.customDomain
    }

    // When it's localhost, an IP, or custom domain, set the cookie directly
    if (is.ip || is.local || is.custom) {
      clone.domain = is.local ? null : clone.domain
      cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain)
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
      if (!uuid) {
        for (; i < ll; i++) {
          cookie.removeItem(storage.name, storage.path, domains[i])
        }
      } else {
        for (; i < ll; i++) {
          clone.domain = domains[i]
          cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain)

          // Break when cookies aren't being cleared and it gets set properly
          // Don't break when uuid is falsy so all the cookies get cleared
          if (cookie.getItem(storage.name) === uuid) {
            // When cookie is set succesfully, save used domain in storage object
            storage.domain = clone.domain
            break
          }
        }
      }
    }
  }

  // Only save cookies if storage is enabled and expires is non-zero
  if (config.storage) {
    if (config.storage.expires) {
      setCookie(config.storage, undefined)
      setCookie(config.storage, this.client.track.uuid)
    }
  }

  // Values must be initialized later because they depend on knowing the uuid
  this.client.track.values = _.assign(configureValues(this.client.track), this.client.track.values)

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
