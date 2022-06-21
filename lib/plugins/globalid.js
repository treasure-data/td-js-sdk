/**
 * Treasure Global ID
 */

// Modules
var noop = require('../utils/lodash').noop
var misc = require('../utils/misc')
var cookie = require('../vendor/js-cookies')
var api = require('../utils/xhr')

function cacheSuccess (result, cookieName, cookieOptions) {
  cookieOptions = cookieOptions || {}

  if (!result['global_id']) {
    return null
  }
  var path = cookieOptions.path
  var domain = cookieOptions.domain
  var secure = cookieOptions.secure
  var maxAge = cookieOptions.maxAge || 6000
  var sameSite = cookieOptions.sameSite

  cookie.setItem(cookieName, result['global_id'], maxAge, path, domain, secure, sameSite)

  return result['global_id']
}

function configure () {
  return this
}

/**
 * @param    {function}           [success]          - Callback for when sending the event is successful
 * @param    {function}           [error]            - Callback for when sending the event is unsuccessful
 * @param    {boolean}            [forceFetch]       - Forces a refetch of global id and ignores cached version (default false)
 * @param    {object}             [options]          - Cookie options Note: If you set the sameSite value to None, the Secure property of the cookie will be set to true (it overwrites the secure option). More details on SameSite cookies.
 * @property {string}             [options.path]     - '/',
 * @property {string}             [options.domain]   - 'mycompany.com',
 * @property {boolean}            [options.secure]   - true|false,
 * @property {number|string|date} [options.maxAge]   - Number | String | Date,
 * @property {string}             [options.sameSite] - 'None | Lax | Strict'
 *
 * @example <caption>Cookie options: Note - If you set the sameSite value to None, the Secure property of the cookie will be set to true (it overwrites the secure option). More details on SameSite cookies.</caption>
 * {
 *   path: '/',
 *   domain: 'abc.com',
 *   secure: true|false,
 *   maxAge: Number | String | Date,
 *   sameSite: 'None | Lax | Strict'
 * }
 *
 * @example
 * var td = new Treasure({...})
 *
 * var successCallback = function (globalId) {
 *   // celebrate();
 * };
 *
 * var errorCallback = function (error) {
 *   // cry();
 * }
 *
 * td.fetchGlobalID(successCallback, errorCallback)
 *
 * // with cookie options
 * td.fetchGlobalID(successCallback, errorCallback, true, {
 *   path: '/',
 *   secure: true,
 *   maxAge: 5 * 60 // 5 minutes,
 *   sameSite: 'None'
 * })
 */
function fetchGlobalID (success, error, forceFetch, options) {
  options = options || {}
  success = success || noop
  error = error || noop
  if (!this.inSignedMode()) {
    return error('not in signed in mode')
  }

  if (!this.isGlobalIdEnabled()) {
    return error('global id is not enabled')
  }
  var cookieName = this.client.globalIdCookie
  var cachedGlobalId = cookie.getItem(cookieName)
  if (cachedGlobalId && !forceFetch) {
    return setTimeout(function () {
      success(cachedGlobalId)
    }, 0)
  }

  if (!options.sameSite) {
    options.sameSite = 'None'
  }

  var url = 'https://' + this.client.host + '/js/v3/enable_global_id'
  var requestHeaders = {}
  var ignoreDefaultHeaders = false

  if (this.client.useNewJavaScriptEndpoint) {
    url = 'https://' + this.client.host

    requestHeaders['Authorization'] = 'TD1 ' + this.client.writeKey
    requestHeaders['User-Agent'] = navigator.userAgent
    requestHeaders['Content-Type'] = misc.globalIdAdlHeaders['Content-Type']
    requestHeaders['Accept'] = misc.globalIdAdlHeaders['Accept']
    ignoreDefaultHeaders = true
  }

  api.get(url,
    {
      headers: requestHeaders,
      ignoreDefaultHeaders: ignoreDefaultHeaders
    })
    .then(function (res) {
      var cachedId = cacheSuccess(res, cookieName, options)

      success(cachedId)
    })
    .catch(function (err) {
      error(err)
    })
}

function removeCachedGlobalID () {
  cookie.removeItem(this.client.globalIdCookie)
}

module.exports = {
  cacheSuccess: cacheSuccess,
  configure: configure,
  fetchGlobalID: fetchGlobalID,
  removeCachedGlobalID: removeCachedGlobalID
}
