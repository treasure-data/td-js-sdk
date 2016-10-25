/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var _ = require('../utils/lodash')
var invariant = require('invariant')
var cookie = require('cookies-js')

function cacheSuccess (result, cookieName) {
  cookie.set(cookieName, result['global_id'], { expires: 6000 })
  return result['global_id']
}

function configure () {
}

function fetchGlobalID (success, error, forceFetch) {
  success = _.isFunction(success) ? success : _.noop
  error = _.isFunction(error) ? error : _.noop
  var cookieName = this.client.globalIdCookie
  var cachedGlobalId = cookie.get(this.client.globalIdCookie)
  if (cachedGlobalId && !forceFetch) {
    return setTimeout(function () {
      success(cachedGlobalId)
    }, 0)
  }

  var url = this.client.protocol + '//' + this.client.host + '/js/v3/global_id'

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
