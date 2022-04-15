var record = require('./record')
var _ = require('./utils/lodash')
var configurator = require('./configurator')
var version = require('./version')
var cookie = require('./vendor/js-cookies')
var config = require('./config')

/**
 * @typedef {object} config
 * @property {string}        config.database                                 - database name, must consist only of lower case letters, numbers, and `_`, must be longer than or equal to 3 chars, and the total length of database and table must be shorter than 129 chars.
 * @property {string}        config.writeKey                                 - write-only key, get it from your user profile
 * @property {string}        [config.pathname]                               - path to append after host. Default: `/js/v3/events`
 * @property {string}        [config.host]                                   - host to which events get sent. Default: `in.treasuredata.com`
 * @property {boolean}       [config.development]                            - triggers development mode which causes requests to be logged and not get sent. Default: `false`
 * @property {boolean}       [config.logging]                                - enable or disable logging. Default: `true`
 * @property {string}        [config.globalIdCookie]                         - cookie td_globalid name. Default: `_td_global`
 * @property {boolean}       [config.startInSignedMode]                      - Tell the SDK to default to Signed Mode if no choice is already made. Default: `false`
 * @property {number}        [config.jsonpTimeout]                           - JSONP timeout (in milliseconds) Default: `10000`
 * @property {boolean}       [config.storeConsentByLocalStorage]             - Tell the SDK to use localStorage to store user consent. Default: `false`
 * @property {string}        [config.clientId]                               - uuid for this client. When undefined it will attempt fetching the value from a cookie if storage is enabled, if none is found it will generate a v4 uuid
 * @property {object|string} [config.storage]                                - storage configuration object. When `none` it will disable cookie storage
 * @property {string}        [config.storage.name]                           - cookie name. Default: `_td`
 * @property {integer}       [config.storage.expires]                        - cookie expiration in seconds. When 0 it will expire with the session. Default: `63072000` (2 years)
 * @property {string}        [config.storage.domain]                         - cookie domain. Default: result of `document.location.hostname`
 * @property {boolean}       [config.useServerSideCookie]                    - enables/disable using ServerSide Cookie. Default: `false`
 * @property {string}        [config.sscDomain]                              - Domain against which the Server Side Cookie is set. Default: `window.location.hostname`
 * @property {string}        [config.sscServer]                              - hostname to request server side cookie from. Default: `ssc.${sscDomain}`
 * @property {string}        [config.cdpHost]                                - The host to use for the Personalization API. Default: 'cdp.in.treasuredata.com'
 * @property {object}        [config.consentManager]                         - Consent Manager configuration, setup along with the TD JavaScript SDK initialization.Every time when a page is loaded, TD JS Consent Extension will check the consent expiry date and if there’s any expired consent, then the expiredConsentCallback is triggered. It also updates status of the expired consent to expired
 * @property {string}        [config.consentManager.storageKey]              - Name of the local storage. Default: `td_consent_preferences`
 * @property {string}        [config.consentManager.consentTable]            - Name of the consent table. Default: `td_cm_consent`
 * @property {string}        [config.consentManager.contextTable]            - Name of the context table. Default: `td_cm_context`
 * @property {string}        [config.consentManager.issuer]                  - Name of the consent management platform. Default: `treasuredata`
 * @property {string}        [config.consentManager.dateFormat]              - Date format string. Default: `YYYY-MM-DD`
 * @property {function}      [config.consentManager.successConsentCallback]  - Successful saving consent callback
 * @property {function}      [config.consentManager.failureConsentCallback]  - Failed to save consent callback
 * @property {function}      [config.consentManager.expiredConsentsCallback] - Expired consent callback
 *
 * */
/**
 * @description Creates a new Treasure logger instance. If the database does not exist and you have permissions, it will be created for you.
 *
 * @param {Treasure.config} config - Treasure Data instance configuration parameters
 * @see {@link config}
 *
 * @returns {td_instance} Treasure logger instance object
 *
 * @example
 * var foo = new Treasure({
 *   database: 'foo',
 *   writeKey: 'your_write_only_key'
 * });
 *
 * */
function Treasure (options) {
  // enforces new
  if (!(this instanceof Treasure)) {
    return new Treasure(options)
  }

  this.init(options)

  return this
}

Treasure.prototype.init = function (options) {
  this.configure(options)

  for (var plugin in Treasure.Plugins) {
    if (Treasure.Plugins.hasOwnProperty(plugin)) {
      Treasure.Plugins[plugin].configure.call(this, options)
    }
  }

  if (window.addEventListener) {
    var that = this
    window.addEventListener('pagehide', function () {
      that._windowBeingUnloaded = true
    })
  }
}

Treasure.version = Treasure.prototype.version = version

Treasure.prototype.log = function () {
  var args = ['[' + config.GLOBAL + ']']
  for (var i = 0, len = arguments.length - 1; i <= len; i++) {
    args.push(arguments[i])
  }
  if (typeof console !== 'undefined' && this.client.logging) {
    console.log.apply(console, args)
  }
}

Treasure.prototype.configure = configurator.configure
Treasure.prototype.set = configurator.set
Treasure.prototype.get = configurator.get
Treasure.prototype.isGlobalIdEnabled = configurator.isGlobalIdEnabled
Treasure.prototype.ready = require('domready')
Treasure.prototype.applyProperties = record.applyProperties
Treasure.prototype.addRecord = record.addRecord
Treasure.prototype.addConsentRecord = record.addConsentRecord
Treasure.prototype._sendRecord = record._sendRecord
Treasure.prototype.blockEvents = record.blockEvents
Treasure.prototype.unblockEvents = record.unblockEvents
Treasure.prototype.areEventsBlocked = record.areEventsBlocked
Treasure.prototype.setSignedMode = record.setSignedMode
Treasure.prototype.setAnonymousMode = record.setAnonymousMode
Treasure.prototype.inSignedMode = record.inSignedMode
Treasure.prototype.getCookie = cookie.getItem
Treasure.prototype._configurator = configurator

// Plugins
Treasure.Plugins = {
  Clicks: require('./plugins/clicks'),
  GlobalID: require('./plugins/globalid'),
  Personalization: require('./plugins/personalization'),
  Track: require('./plugins/track'),
  ServerSideCookie: require('./plugins/servercookie'),
  ConsentManager: require('./plugins/consent-manager')
}

// Load all plugins
_.forIn(Treasure.Plugins, function (plugin) {
  _.forIn(plugin, function (method, name) {
    if (!Treasure.prototype[name]) {
      Treasure.prototype[name] = method
    }
  })
})

module.exports = Treasure
