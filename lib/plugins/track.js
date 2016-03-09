/*!
* ----------------------
* Treasure Tracker
* ----------------------
*/

// Modules
var verge = require('verge')
var _ = require('../utils/lodash')
var cookie = require('cookies-js')
var generateUUID = require('../utils/generateUUID')

// Helpers
function configureValues (track) {
  track.values = track.values || {}

  _.defaults(track.values, {
    td_version: function () {
      return '1.5.2'
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
      return verge.viewportW().toString() + 'x' + verge.viewportH().toString()
    },
    td_title: function () {
      return document.title
    },
    td_url: function () {
      var url = document.location.href
      var i = _.indexOf('#')
      return i === -1 ? url : url.slice(0, i)
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
  })

  return track.values
}

function configureTrack (track) {
  track = track || {}

  _.defaults(track, {
    pageviews: 'pageviews',
    events: 'events',
    values: {}
  })

  return track
}

function configureStorage (storage) {
  if (storage === 'none') {
    return false
  }

  storage = _.isObject(storage) ? storage : {}
  _.defaults(storage, {
    name: '_td',
    expires: 63072000,
    domain: document.location.hostname,
    customDomain: !!storage.domain,
    path: '/'
  })

  return storage
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
      config.clientId = cookie.get(config.storage.name)
    }
    if (!config.clientId) {
      config.clientId = generateUUID()
    }
  }

  // Remove any NULLs that might be present in the clientId
  this.client.track.uuid = config.clientId.replace(/\0/g, '')

  // Set cookie on highest allowed domain
  var setCookie = function (storage, uuid) {
    var clone = _.clone(storage)
    var is = {
      ip: storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
      local: storage.domain === 'localhost',
      custom: storage.customDomain
    }

    // When it's localhost, an IP, or custom domain, set the cookie directly
    if (is.ip || is.local || is.custom) {
      clone.domain = is.local ? null : clone.domain
      cookie(storage.name, uuid, clone)
    } else {
      // Otherwise iterate recursively on the domain until it gets set
      // For example, if we have three sites:
      // bar.foo.com, baz.foo.com, foo.com
      // First it tries setting a cookie on .com, and it fails
      // Then it sets the cookie on foo.com, and it'll pass
      var domain = storage.domain.split('.')
      for (var i = domain.length - 1; i >= 0; i--) {
        clone.domain = (domain.slice(i).join('.'))
        cookie(storage.name, uuid, clone)

        // Break when cookies aren't being cleared and it gets set properly
        // Don't break when uuid is falsy so all the cookies get cleared
        if (cookie.get(storage.name) && uuid) {
          // When cookie is set succesfully, save used domain in storage object
          storage.domain = clone.domain
          break
        }
      }
    }
  }

  // Only save cookies if storage is enabled and expires is non-zero
  if (config.storage) {
    if (config.storage.expires) {
      // Must clear cookie first to ensure it gets set on the top valid domain
      setCookie(config.storage, undefined)
      setCookie(config.storage, this.client.track.uuid)
    }
  }

  // Values must be initialized later because they depend on knowing the uuid
  _.defaults(this.client.track.values, configureValues(this.client.track))
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

  record = record || {}
  _.defaults(record, this.getTrackValues())
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
      if (_.isString(value)) {
        result[key] = value
      } else if (_.isFunction(value)) {
        result[key] = value()
      }
    }
  })
  return result
}

