var jsonp = require('jsonp')
var noop = require('../utils/misc').noop
var invariant = require('../utils/misc').invariant
var _ = require('../utils/lodash')

/**
 * Personalization#configure
 *
 * config (Object) - configuration object
 * config.cdpHost (String)
 *    - The host to use for the Personalization API
 *    - defaults to 'cdp.in.treasuredata.com'
 *
 *    Possible values:
 *    Region    cdpHost                       host
 *    AWS East  cdp.in.treasuredata.com       in.treasuredata.com
 *    AWS Tokyo cdp-tokyo.in.treasuredata.com tokyo.in.treasuredata.com
 *    IDCF      cdp-idcf.in.treasuredata.com  idcf.in.treasuredata.com
 */
function configure (config) {
  config = _.isObject(config) ? config : {}
  this.client.cdpHost = config.cdpHost || 'cdp.in.treasuredata.com'
  return this
}

function fetchUserSegments (tokenOrConfig, successCallback, errorCallback) {
  var audienceToken = _.isObject(tokenOrConfig) ? tokenOrConfig.audienceToken : tokenOrConfig
  var keys = _.isObject(tokenOrConfig) ? tokenOrConfig.keys : {}

  successCallback = successCallback || noop
  errorCallback = errorCallback || noop

  invariant(
    typeof audienceToken === 'string' || _.isArray(audienceToken),
    'audienceToken must be a string or array; received "' + audienceToken.toString() + '"'
  )

  invariant(
    _.isObject(keys),
    'keys must be an object; received "' + audienceToken.toString() + '"'
  )

  var token = _.isArray(audienceToken) ? audienceToken.join(',') : audienceToken
  var keyString = _.keys(keys)
    .map(function (key) {
      return ['key.', key, '=', keys[key]].join('')
    }).join('&')

  var url = 'https://' + this.client.cdpHost + '/cdp/lookup/collect/segments?token=' + token + keyString

  jsonp(url, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000
  }, function (err, res) {
    return err ? errorCallback(err) : successCallback(res && res.key, res && res.values)
  })
}

module.exports = {
  configure: configure,
  fetchUserSegments: fetchUserSegments
}
