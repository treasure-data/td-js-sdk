/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var _ = require('./utils/lodash')
var invariant = require('invariant')

function cacheSuccess (result, context) {
  if (context.setCookie) {
    context.setCookie(context.client.globalIdCookie, result['global_id'])
  }
  return result['global_id']
}

module.exports = function fetchGlobalID (success, error, forceFetch) {
  success = _.isFunction(success) ? success : _.noop
  error = _.isFunction(error) ? error : _.noop

  const cachedGlobalId = this.getCookie && this.getCookie(this.client.globalIdCookie)
  if (cachedGlobalId && !forceFetch) {
    return cachedGlobalId
  }

  var request = {
    url: this.client.endpoint + '/global_id',
    type: this.client.requestType
  }

  invariant(
    request.type === 'jsonp',
    'Request type ' + request.type + ' not supported'
  )

  var self = this
  jsonp(request.url, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000 // 10 seconds timeout
  }, function (err, res) {
    return err ? error(err) : success(cacheSuccess(res, self))
  })
}
