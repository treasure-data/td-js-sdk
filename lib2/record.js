/**
 * Treasure Record
 */

// Modules
var jsonp = require('jsonp')
var _ = require('./utils/lodash')
var invariant = require('invariant')
var objectToBase64 = require('./utils/objectToBase64')

// Helpers

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

/**
 * Send record
 */
exports._sendRecord = function _sendRecord (request, success, error) {
  success = _.isFunction(success) ? success : _.noop
  error = _.isFunction(error) ? error : _.noop

  invariant(
    request.type === 'jsonp',
    'Request type ' + request.type + ' not supported'
  )

  var params = [
    'api_key=' + encodeURIComponent(request.apikey),
    'modified=' + encodeURIComponent(new Date().getTime()),
    'data=' + encodeURIComponent(objectToBase64(request.record))
  ]

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
exports.applyProperties = function applyProperties (table, payload) {
  var obj = {}
  _.assign(obj, this.get('$global'))
  _.assign(obj, this.get(table))
  _.assign(obj, payload)
  return obj
}

/**
 * Treasure#addRecord
 *
 * Takes a table and a record
 *
 */
exports.addRecord = function addRecord (table, record, success, error) {
  validateRecord(table, record)

  var request = {
    url: this.client.endpoint + this.client.database + '/' + table,
    record: this.applyProperties(table, record),
    type: this.client.requestType,
    apikey: this.client.writeKey
  }

  if (this.client.development) {
    this.log('addRecord', request)
  } else {
    this._sendRecord(request, success, error)
  }
}

// Private functions, for testing only
exports._validateRecord = validateRecord
