/**
 * Treasure Configurator
 */

// Modules
var _ = require('./utils/lodash')
var invariant = require('invariant')

// Helpers
function generateDefaultConfig () {
  return {
    protocol: document.location.protocol,
    host: 'in.treasuredata.com',
    pathname: '/js/v3/event/',
    requestType: 'jsonp',
    development: false,
    logging: true
  }
}

// customized when DEFAULT_CONFIG is not equal to generateDefaultConfig()
function isCustomized () {
  return !_.isEqual(exports.DEFAULT_CONFIG, generateDefaultConfig())
}

function validateOptions (options) {
  // options must be an object
  invariant(
    _.isObject(options),
    'Check out our JavaScript SDK Usage Guide: ' +
    'http://docs.treasuredata.com/articles/javascript-sdk'
  )

  invariant(
    _.isString(options.writeKey),
    'Must provide a writeKey'
  )

  invariant(
    _.isString(options.database),
    'Must provide a database'
  )

  invariant(
    /^[a-z0-9_]{3,255}$/.test(options.database),
    'Database must be between 3 and 255 characters and must ' +
    'consist only of lower case letters, numbers, and _'
  )
}

// Config defaults and generator
exports._generateDefaultConfig = generateDefaultConfig
exports.DEFAULT_CONFIG = generateDefaultConfig()

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
  if (isCustomized()) {
    options = options || {}
  }
  _.defaults(options, exports.DEFAULT_CONFIG)
  validateOptions(options)
  this.client = {
    requestType: 'jsonp'
  }
  _.defaults(this.client, options)

  // Add the : if it's mixing from the protocol
  // This is for backwards compatibility
  if (!_.includes(this.client.protocol, ':')) {
    this.client.protocol += ':'
  }

  _.defaults(this.client, {
    globals: {},
    endpoint: this.client.protocol + '//' + this.client.host + this.client.pathname
  })

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
