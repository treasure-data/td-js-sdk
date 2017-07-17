/**
 * Treasure Record
 */

// Modules
var invariant = require('../utils/misc').invariant
var noop = require('../utils/misc').noop
var jsonp = require('jsonp')
var _ = require('../utils/lodash')

var objectToBase64 = require('../utils/objectToBase64')

// Helpers
function validateConfig (options) {
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
/**
 * Validate record
 */
function validateRecord (table, record) {
  invariant(
    _.isString(table),
    'Must provide a table'
  )

  invariant(
    /^[a-z0-9_]{3,255}$/.test(table),
    'Table must be between 3 and 255 characters and must ' +
    'consist only of lower case letters, numbers, and _'
  )

  invariant(
    _.isObject(record),
    'Must provide a record'
  )
}

var DEFAULT_CONFIG = {
  pathname: '/js/v3/event/',
  requestType: 'jsonp'
}

/**
 * Record#configure
 * Checks validity
 *
 * Modify DEFAULT_CONFIG to change any defaults
 * Protocol defaults to auto-detection but can be set manually
 * host defaults to in.treasuredata.com
 * pathname defaults to /js/v3/event/
 * requestType is always jsonp
 */
function configure (options) {
  this.client = _.assign(this.client, {
    _recordConfigured: true
  }, DEFAULT_CONFIG, options)

  validateConfig(this.client)

  // Add the : if it's missing from the protocol
  // This is for backwards compatibility
  if (!/:$/.test(this.client.protocol)) {
    this.client.protocol += ':'
  }

  if (!this.client.endpoint) {
    this.client.endpoint = this.client.protocol + '//' + this.client.host + this.client.pathname
  }
}

/**
 * Send record
 */
function _sendRecord (request, success, error) {
  success = success || noop
  error = error || noop

  invariant(
    request.type === 'jsonp',
    'Request type ' + request.type + ' not supported'
  )

  var params = [
    'api_key=' + encodeURIComponent(request.apikey),
    'modified=' + encodeURIComponent(new Date().getTime()),
    'data=' + encodeURIComponent(objectToBase64(request.record))
  ]

  if (request.time) {
    params.push('time=' + encodeURIComponent(request.time))
  }

  var jsonpUrl = request.url + '?' + params.join('&')
  jsonp(jsonpUrl, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000 // 10 seconds timeout
  }, function (err, res) {
    return err ? error(err) : success(res)
  })
}

// Methods

/**
 * Treasure#applyProperties
 *
 * Applies properties on a a payload object
 *
 * Starts with an empty object and applies properties in the following order:
 * $global -> table -> payload
 *
 * $global attributes are initially set on all objects
 * table attributes overwrite $global attributes for specific tables
 * payload attributes overwrite set $global and table attributes
 *
 * Expects a table name and a payload object as parameters
 * Returns a new object with all properties applied
 *
 * Example:
 * td.set('$global', 'foo', 'bar')
 * td.set('$global', 'bar', 'foo')
 * td.set('table', 'foo', 'foo')
 *
 * td.applyProperties('sales', {})
 * // > { foo: 'bar', bar: 'foo'}
 *
 * td.applyProperties('table', {})
 * // > { foo: 'foo', bar: 'foo'}
 *
 * td.applyProperties('table', {bar: 'bar'})
 * // > { foo: 'foo', bar: 'bar'}
 *
 * td.applyProperties('table', {foo: 'qux'})
 * // > { foo: 'qux', bar: 'foo'}
 *
 */
function applyProperties (table, payload) {
  return _.assign({}, this.get('$global'), this.get(table), payload)
}

/**
 * Treasure#addRecord
 *
 * Takes a table and a record
 *
 */
function addRecord (table, record, success, error) {
  if (!this.client._recordConfigured) {
    this.log('The Record plugin must be initialized before any records can be sent.')
    return this
  }
  validateRecord(table, record)

  var request = {
    apikey: this.client.writeKey,
    record: this.applyProperties(table, record),
    time: null,
    type: this.client.requestType,
    url: this.client.endpoint + this.client.database + '/' + table
  }

  if (request.record.time) {
    request.time = request.record.time
  }

  if (this.client.development) {
    this.log('addRecord', request)
  } else {
    this._sendRecord(request, success, error)
  }
}

// Private functions, for testing only
exports._validateRecord = validateRecord

module.exports = {
  addRecord: addRecord,
  applyProperties: applyProperties,
  configure: configure,
  _sendRecord: _sendRecord,
  _validateConfig: validateConfig,
  _validateRecord: validateRecord
}
