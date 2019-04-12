/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var invariant = require('../utils/misc').invariant
var noop = require('../utils/misc').noop
// use actual cookie because this expiration is short
var setCookie = require('../utils/setCookie')

function cacheSuccess (storage, result, cookieName) {
  setCookie.setCookie(storage, cookieName, result['global_id'], 6000)
  return result['global_id']
}

function configure () {}

function fetchGlobalID (success, error, forceFetch) {
  success = success || noop
  error = error || noop

  var cookieName = this.client.globalIdCookie
  var cachedGlobalId = this.getCookie(this.client.globalIdCookie)
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
  var _this = this

  jsonp(
    url,
    {
      prefix: 'TreasureJSONPCallback',
      timeout: this.client.jsonpTimeout
    },
    function (err, res) {
      return err
        ? error(err)
        : success(cacheSuccess(_this.client.storage, res, cookieName))
    }
  )
}

module.exports = {
  cacheSuccess: cacheSuccess,
  configure: configure,
  fetchGlobalID: fetchGlobalID
}
