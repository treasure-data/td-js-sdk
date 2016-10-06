/**
 * Treasure Global ID
 */

// Modules
var jsonp = require('jsonp')
var _ = require('./utils/lodash')
var invariant = require('invariant')

module.exports = function globalId (success, error) {
  success = _.isFunction(success) ? success : _.noop
  error = _.isFunction(error) ? error : _.noop

  var request = {
    url: this.client.endpoint + '/global_id',
    type: this.client.requestType,
    apiKey: this.client.writeKey
  }

  invariant(
    request.type === 'jsonp',
    'Request type ' + request.type + ' not supported'
  )

  var params = [
    'api_key=' + encodeURIComponent(request.apiKey)
  ]

  var jsonpUrl = request.url + '?' + params.join('&')
  jsonp(jsonpUrl, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000 // 10 seconds timeout
  }, function (err, res) {
    return err ? error(err) : success(res)
  })
}
