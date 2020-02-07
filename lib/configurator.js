/**
 * Treasure Configurator
 */

// Modules
var _ = require('./utils/lodash')
var invariant = require('./utils/misc').invariant
var config = require('./config')
var cookie = require('./vendor/js-cookies')

// Helpers
function validateOptions (options) {
  // options must be an object
  invariant(
    _.isObject(options),
    'Check out our JavaScript SDK Usage Guide: ' +
      'http://docs.treasuredata.com/articles/javascript-sdk'
  )

  invariant(_.isString(options.writeKey), 'Must provide a writeKey')

  invariant(_.isString(options.database), 'Must provide a database')

  invariant(
    /^[a-z0-9_]{3,255}$/.test(options.database),
    'Database must be between 3 and 255 characters and must ' +
      'consist only of lower case letters, numbers, and _'
  )
}

var defaultSSCCookieDomain = function () {
  var domainChunks = document.location.hostname.split('.')
  for (var i = domainChunks.length - 2; i >= 1; i--) {
    var domain = domainChunks.slice(i).join('.')
    var name = '_td_domain_' + domain // append domain name to avoid race condition
    cookie.setItem(name, domain, 3600, '/', domain)
    if (cookie.getItem(name) === domain) {
      return domain
    }
  }
  return document.location.hostname
}

// Default config for library values
exports.DEFAULT_CONFIG = {
  database: config.DATABASE,
  development: false,
  globalIdCookie: '_td_global',
  host: config.HOST,
  logging: true,
  pathname: config.PATHNAME,
  requestType: 'jsonp',
  jsonpTimeout: 10000,
  startInSignedMode: false,
  useServerSideCookie: false,
  sscDomain: defaultSSCCookieDomain,
  sscServer: function (cookieDomain) {
    return ['ssc', cookieDomain].join('.')
  },
  storeConsentByLocalStorage: false,
  debugMode: false
}

/**
 * Treasure#configure
 *
 * Initial configurator
 * Checks validity
 * Creates and sets up client object
 *
 * Modify DEFAULT_CONFIG to change any defaults
 * Protocol defaults to auto-detection but can be set manually
 * host defaults to in.treasuredata.com
 * pathname defaults to /js/v3/event/
 * requestType is always jsonp
 *
 */
exports.configure = function configure (options) {
  this.client = _.assign(
    {
      globals: {}
    },
    exports.DEFAULT_CONFIG,
    options,
    {
      requestType: 'jsonp'
    }
  )

  validateOptions(this.client)

  if (!this.client.endpoint) {
    this.client.endpoint = 'https://' + this.client.host + this.client.pathname
  }
  return this
}

/**
 * Treasure#set
 *
 * Table value setter
 * When you set mutliple attributes, the object is iterated and values are set on the table
 * Attributes are not recursively set on the table
 *
 * Setting a single attribute
 * Example: td.set('table', 'foo', 'bar')
 *
 * Setting multiple properties at once
 * Example: td.set('table', {foo: 'bar', baz: 'qux'})
 *
 * Defaults to setting all attributes in $global
 * The following are equivalent:
 * td.set({foo: 'bar'}) == td.set('$global', {foo: 'bar'})
 *
 * Attributes in $global get applied to all tables
 *
 */
exports.set = function set (table, property, value) {
  if (_.isObject(table)) {
    property = table
    table = '$global'
  }

  this.client.globals[table] = this.client.globals[table] || {}
  if (_.isObject(property)) {
    _.assign(this.client.globals[table], property)
  } else {
    this.client.globals[table][property] = value
  }

  return this
}

/**
 * Treasure#get
 *
 * Table value getter
 *
 * Getting a single attribute
 * Example:
 * td.get('table', 'foo')
 * // > 'bar'
 *
 * Getting all attributes from a table
 * Example:
 * td.get('table')
 * // > {foo: 'bar'}
 *
 * Defaults to getting all attributes from $global
 * The following are equivalent:
 * td.get() == td.get('$global')
 * // > {}
 *
 * If the table does not exist, its object gets created
 *
 */
exports.get = function get (table, key) {
  // If no table, show $global
  table = table || '$global'

  this.client.globals[table] = this.client.globals[table] || {}
  return key ? this.client.globals[table][key] : this.client.globals[table]
}
