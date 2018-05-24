/**
 * Treasure Record
 */

// Modules
var invariant = require('./utils/misc').invariant
var noop = require('./utils/misc').noop
var jsonp = require('jsonp')
var _ = require('./utils/lodash')
var cookie = require('./vendor/js-cookies')
var setCookie = require('./utils/setCookie')

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

var BLOCKEVENTSCOOKIE = '__td_blockEvents'
var SIGNEDMODECOOKIE = '__td_signed'

exports.BLOCKEVENTSCOOKIE = BLOCKEVENTSCOOKIE
exports.SIGNEDMODECOOKIE = SIGNEDMODECOOKIE

/**
 * Block all record-tracking
 */
exports.blockEvents = function blockEvents () {
  setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'true')
}

/**
 * Unblock record-tracking
 */
exports.unblockEvents = function unblockEvents () {
  setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'false')
}

/**
 * Find event-blocking state
 */
exports.areEventsBlocked = function areEventsBlocked () {
  return cookie.getItem(BLOCKEVENTSCOOKIE) === 'true'
}

/**
 * setSignedMode
 *
 * Sets the user to Signed Mode
 */
exports.setSignedMode = function setSignedMode (signedMode) {
  setCookie(this.client.storage, SIGNEDMODECOOKIE, 'true')
  return this
}

/**
 * setAnonymousMode
 *
 * Sets the user to anonymous mode
 */
exports.setAnonymousMode = function setAnonymousMode (signedMode) {
  setCookie(this.client.storage, SIGNEDMODECOOKIE, 'false')
  return this
}

/**
 * inSignedMode
 *
 * Tells whether or not the user is in Signed Mode
 */
exports.inSignedMode = function inSignedMode () {
  return cookie.getItem(SIGNEDMODECOOKIE) !== 'false' &&
    (cookie.getItem(SIGNEDMODECOOKIE) === 'true' ||
    this.client.startInSignedMode)
}

/**
 * Send record
 */
exports._sendRecord = function _sendRecord (request, success, error) {
  success = success || noop
  error = error || noop

  if (this.areEventsBlocked()) {
    return
  }

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
exports.applyProperties = function applyProperties (table, payload) {
  return _.assign({}, this.get('$global'), this.get(table), payload)
}

/**
 * Treasure#addRecord
 *
 * Takes a table and a record
 *
 */
exports.addRecord = function addRecord (table, record, success, error) {
  validateRecord(table, record)
  var propertiesRecord = this.applyProperties(table, record)
  var finalRecord = this.inSignedMode()
    ? propertiesRecord
    : _.omit(propertiesRecord, ['td_ip', 'td_client_id', 'td_global_id'])
  var request = {
    apikey: this.client.writeKey,
    record: finalRecord,
    time: null,
    type: this.client.requestType,
    url: this.client.endpoint + this.client.database + '/' + table
  }

  if (request.record.time) {
    request.time = request.record.time
  }

  if (this.client.development) {
    this.log('addRecord', request)
  } else if (!this.areEventsBlocked()) {
    this._sendRecord(request, success, error)
  }
}

// Private functions, for testing only
exports._validateRecord = validateRecord
