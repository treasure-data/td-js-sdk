/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var noop = require('../utils/lodash').noop
var cookie = require('../vendor/js-cookies')

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

function fetchGlobalID (success, error, forceFetch, options) {
  options = options || {}
  success = success || noop
  error = error || noop
  if (!this.inSignedMode()) {
    return error('not in signed in mode')
  }
  var cookieName = this.client.globalIdCookie
  var cachedGlobalId = cookie.getItem(this.client.globalIdCookie)
  if (cachedGlobalId && !forceFetch) {
    return setTimeout(function () {
      success(cachedGlobalId)
    }, 0)
  }

  if (!options.sameSite) {
    options.sameSite = 'None'
  }

  var url = 'https://' + this.client.host + '/js/v3/global_id'

  jsonp(
    url,
    {
      prefix: 'TreasureJSONPCallback',
      timeout: this.client.jsonpTimeout
    },
    function (err, res) {
      return err ? error(err) : success(cacheSuccess(res, cookieName, options))
    }
  )
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
