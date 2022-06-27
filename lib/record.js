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

var invariant = misc.invariant
// Helpers

/*
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
 * @Treasure.blockEvents
 * Block all events from being sent to Treasure Data.
 *
 * @example
 * var td = new Treasure({...})
 * td.trackEvent('customevent')
 * td.blockEvents()
 * td.trackEvent('willnotbetracked')
 */
exports.blockEvents = function blockEvents () {
  setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'true')
}

/**
 * @Treasure.unblockEvents
 * Unblock all events; events will be sent to Treasure Data.
 *
 * @example
 * var td = new Treasure({...})
 * td.blockEvents()
 * td.trackEvent('willnotbetracked')
 * td.unblockEvents()
 * td.trackEvent('willbetracked')
 */
exports.unblockEvents = function unblockEvents () {
  setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'false')
}

/**
 * @Treasure.areEventsBlocked
 * Informational method, expressing whether events are blocked or not.
 *
 * @example
 * var td = new Treasure({...})
 * td.areEventsBlocked() // false, default
 * td.blockEvents()
 * td.areEventsBlocked() // true
 */
exports.areEventsBlocked = function areEventsBlocked () {
  return cookie.getItem(BLOCKEVENTSCOOKIE) === 'true'
}

/**
 * @Treasure.setSignedMode
 * Sets the user to Signed Mode.
 * Permit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id
 *
 * @example
 * var td = new Treasure({...})
 * td.setSignedMode()
 * td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
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
 * @Treasure.setAnonymousMode
 *
 * Sets the user to anonymous mode.
 * Prohibit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id
 *
 * @param {boolean} keepIdentifier - Keep the cookies. By default setAnonymousMode will remove all cookies that are set by Treasure Data JavaScript SDK, you can set keepIdentifier parameter to true to not remove the cookies.
 *
 * @example
 * var td = new Treasure({...})
 * td.setAnonymousMode()
 * td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
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
 * @Treasure.inSignedMode
 *
 * Tells whether or not the user is in Signed Mode.
 * Informational method, indicating whether trackEvents method will automatically collect td_ip, td_client_id, and td_global_id if set.
 *
 * @example
 * var td = new Treasure({...})
 * td.inSignedMode() // false, default
 * td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
 * td.setSignedMode()
 * td.inSignedMode() // true
 * td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
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

/*
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

  var requestHeaders = {}
  var payload
  var ignoreDefaultHeaders = false

  if (this.client.useNewJavaScriptEndpoint) {
    requestHeaders['Authorization'] = 'TD1 ' + request.apikey
    requestHeaders['User-Agent'] = navigator.userAgent

    if (this.isGlobalIdEnabled()) {
      requestHeaders['Content-Type'] = misc.globalIdAdlHeaders['Content-Type']
      requestHeaders['Accept'] = misc.globalIdAdlHeaders['Accept']
    } else {
      requestHeaders['Content-Type'] = misc.adlHeaders['Content-Type']
      requestHeaders['Accept'] = misc.adlHeaders['Accept']
    }

    ignoreDefaultHeaders = true

    payload = {
      events: [request.record]
    }
  } else {
    requestHeaders['X-TD-Write-Key'] = request.apikey
    payload = request.record
  }

  if (window.fetch && (this._windowBeingUnloaded || isClickedLink)) {
    api
      .postWithTimeout(
        url,
        payload,
        this.client.jsonpTimeout,
        {
          method: 'POST',
          keepalive: true,
          credentials: 'include',
          ignoreDefaultHeaders: ignoreDefaultHeaders,
          headers: requestHeaders
        }
      )
      .then(success)
      .catch(error)
  } else {
    api
      .post(
        url,
        payload,
        {
          ignoreDefaultHeaders: ignoreDefaultHeaders,
          headers: requestHeaders
        }
      )
      .then(success)
      .catch(error)
  }
}

// Methods

/*
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
 * Sends an event to Treasure Data. If the table does not exist it will be created for you.
 * Records will have additional properties applied to them if $global or table-specific attributes are configured using Treasure#set.
 *
 * @param {string}  table     - table name, must consist only of lower case letters, numbers, and _, must be longer than or equal to 3 chars, the total length of database and table must be shorter than 129 chars.
 * @param {object}  record    - Object that will be serialized to JSON and sent to the server
 * @param {boolean=} [success] - Callback for when sending the event is successful
 * @param {boolean=} [error]   - Callback for when sending the event is unsuccessful
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
