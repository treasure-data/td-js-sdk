/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var invariant = require('../utils/misc').invariant
var noop = require('../utils/misc').noop
var cookie = require('../vendor/js-cookies')

function cacheSuccess (result, cookieName) {
  cookie.setItem(cookieName, result['global_id'], 6000)
  return result['global_id']
}

function configure () {
}

function fetchGlobalID (success, error, forceFetch) {
  success = success || noop
  error = error || noop

  var cookieName = this.client.globalIdCookie
  var cachedGlobalId = cookie.getItem(this.client.globalIdCookie)
  if (cachedGlobalId && !forceFetch) {
    return setTimeout(function () {
      success(cachedGlobalId)
    }, 0)
  }

  var url = 'https://' + this.client.host + '/js/v3/global_id'

  invariant(
    this.client.requestType === 'jsonp',
    'Request type ' + this.client.requestType + ' not supported'
  )

  jsonp(url, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000 // 10 seconds timeout
  }, function (err, res) {
    return err ? error(err) : success(cacheSuccess(res, cookieName))
  })
}

module.exports = {
  cacheSuccess: cacheSuccess,
  configure: configure,
  fetchGlobalID: fetchGlobalID
}
