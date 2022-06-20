/*
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
      'https://github.com/treasure-data/td-js-sdk#api'
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
  useNewJavaScriptEndpoint: false,
  globalIdCookie: '_td_global',
  host: config.HOST,
  logging: true,
  pathname: config.PATHNAME,
  requestType: 'fetch',
  jsonpTimeout: 10000,
  startInSignedMode: false,
  useServerSideCookie: false,
  sscDomain: defaultSSCCookieDomain,
  sscServer: function (cookieDomain) {
    return ['ssc', cookieDomain].join('.')
  },
  storeConsentByLocalStorage: false
}

/*
 * Initial configurator
 * Checks validity
 * Creates and sets up client object
 *
 * Modify DEFAULT_CONFIG to change any defaults
 * Protocol defaults to auto-detection but can be set manually
 * host defaults to in.treasuredata.com
 * pathname defaults to /js/v3/event/
 * requestType is always fetch
 *
 * */
exports.configure = function configure (options) {
  this.client = _.assign(
    {
      globals: {}
    },
    exports.DEFAULT_CONFIG,
    options,
    {
      requestType: 'fetch'
    }
  )

  validateOptions(this.client)

  if (this.client.useNewJavaScriptEndpoint) {
    this.client.pathname = '/'
  }

  if (!this.client.endpoint) {
    this.client.endpoint = 'https://' + this.client.host + this.client.pathname
  }
  return this
}

/**
 * Useful when you want to set multiple values.
 * Table value setter
 * When you set mutliple attributes, the object is iterated and values are set on the table
 * Attributes are not recursively set on the table
 *
 * @param {string} table - table name
 * @param {object} properties - Object with keys and values that you wish applies on the table each time a record is sent
 *
 * @example
 * var td = new Treasure({...})
 * td.set('table', {foo: 'foo', bar: 'bar'});
 * td.addRecord('table', {baz: 'baz'});
 * //  Sends:
 * // {
 * //   "foo": "foo",
 * //   "bar": "bar",
 * //   "baz": "baz"
 * // }
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
 * Takes a table name and returns an object with its default values.
 * If the table does not exist, its object gets created
 *
 * NOTE: This is only available once the library has loaded. Wrap any getter with a Treasure#ready callback to ensure the library is loaded.
 *
 * @param {string} table - table name
 * @param {string} [key] - Optional key to get from the table
 *
 * @example <caption>Getting all rows in a table</caption>
 * var td = new Treasure({..});
 * td.set('table', 'foo', 'bar');
 * td.get('table');
 * // {foo: 'bar'}
 *
 * @example <caption>Getting a single attribute</caption>
 * var td = new Treasure({..});
 * td.get('table', 'foo')
 * // > 'bar'
 */
exports.get = function get (table, key) {
  // If no table, show $global
  table = table || '$global'

  this.client.globals[table] = this.client.globals[table] || {}
  return key ? this.client.globals[table][key] : this.client.globals[table]
}

exports.isGlobalIdEnabled = function () {
  return this.get(null, 'td_global_id') === 'td_global_id'
}
