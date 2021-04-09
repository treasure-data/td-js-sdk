/**
 * Treasure Record
 */

// Modules
var misc = require('./utils/misc')
var _ = require('./utils/lodash')
var global = require('global')
var cookie = require('./vendor/js-cookies')
var setCookie = require('./utils/setCookie')
var api = require('./utils/xhr')

var noop = _.noop

var fetchWithTimeout = misc.fetchWithTimeout
var invariant = misc.invariant
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
exports.setSignedMode = function setSignedMode () {
  if (this.client.storeConsentByLocalStorage) {
    if (!misc.isLocalStorageAccessible()) return this
    global.localStorage.setItem(SIGNEDMODECOOKIE, 'true')
  } else {
    setCookie(this.client.storage, SIGNEDMODECOOKIE, 'true')
  }

  this.resetUUID(this.client.storage, this.client.track.uuid)
  return this
}

/**
 * setAnonymousMode
 *
 * Sets the user to anonymous mode
 */
exports.setAnonymousMode = function setAnonymousMode (keepIdentifier) {
  if (this.client.storeConsentByLocalStorage) {
    if (!misc.isLocalStorageAccessible()) return this

    global.localStorage.setItem(SIGNEDMODECOOKIE, 'false')
  } else {
    setCookie(this.client.storage, SIGNEDMODECOOKIE, 'false')
  }

  if (!keepIdentifier) {
    // remove _td cookie
    setCookie(this.client.storage, this.client.storage.name)

    // remove global id cookie
    this.removeCachedGlobalID()

    // remove server side cookie
    this.removeServerCookie()
  }

  return this
}

/**
 * inSignedMode
 *
 * Tells whether or not the user is in Signed Mode
 */
exports.inSignedMode = function inSignedMode () {
  if (this.client.storeConsentByLocalStorage) {
    if (!misc.isLocalStorageAccessible()) return false

    return global.localStorage.getItem([SIGNEDMODECOOKIE]) !== 'false' &&
    (global.localStorage.getItem([SIGNEDMODECOOKIE]) === 'true' ||
    this.client.startInSignedMode)
  }
  return cookie.getItem(SIGNEDMODECOOKIE) !== 'false' &&
    (cookie.getItem(SIGNEDMODECOOKIE) === 'true' ||
    this.client.startInSignedMode)
}

/**
 * Send record
 */
exports._sendRecord = function _sendRecord (request, success, error, blockedEvent) {
  success = success || noop
  error = error || noop

  if (blockedEvent) {
    return
  }

  var params = [
    'modified=' + encodeURIComponent(new Date().getTime())
  ]

  if (request.time) {
    params.push('time=' + encodeURIComponent(request.time))
  }

  var url = request.url + '?' + params.join('&')
  var isClickedLink = request.record.tag === 'a' && !!request.record.href

  if (window.fetch && (this._windowBeingUnloaded || isClickedLink)) {
    // @TODO Refactor to use xhr.js
    fetchWithTimeout(url, this.client.jsonpTimeout, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-TD-Fetch-Api': true,
        'X-TD-Write-Key': request.apikey
      },
      body: JSON.stringify(request.record)
    })
      .then(function (response) {
        success(response)
      })['catch'](function (err) {
        error(err)
      })
  } else {
    api.post(
      url,
      request.record,
      {
        headers: {
          'X-TD-Write-Key': request.apikey
        }
      }
    )
      .then(success)
      .catch(error)
  }
}

// Methods

/**
 * Treasure#applyProperties
 *
 * Applies properties on a payload object
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
    this._sendRecord(request, success, error, this.areEventsBlocked())
  }
}

exports.addConsentRecord = function addConsentRecord (table, record, success, error) {
  validateRecord(table, record)
  var request = {
    apikey: this.client.writeKey,
    record: record,
    time: null,
    type: this.client.requestType,
    url: this.client.endpoint + this.client.database + '/' + table
  }

  if (request.record.time) {
    request.time = request.record.time
  }

  if (this.client.development) {
    this.log('addConsentRecord', request)
  } else {
    this._sendRecord(request, success, error, false)
  }
}

// Private functions, for testing only
exports._validateRecord = validateRecord
