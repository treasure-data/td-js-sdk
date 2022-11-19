var invariant = require('../utils/misc').invariant
var _ = require('../utils/lodash')
var api = require('../utils/xhr')

var noop = _.noop

/*
 * @param {object} config - configuration object
 * @property {string} config.cdpHost - The host to use for the Personalization API, defaults to 'cdp.in.treasuredata.com' .
 *
 * @example
 *    Possible values:
 *    Region                    cdpHost                       host
 *    AWS East                  cdp.in.treasuredata.com       in.treasuredata.com
 *    AWS Tokyo                 cdp-tokyo.in.treasuredata.com tokyo.in.treasuredata.com
 *    AWS EU                    cdp-eu01.in.treasuredata.com  eu01.in.treasuredata.com
 *    AWS Asia Pacific (Seoul)  cdp-ap02.in.treasturedata.com ap02.in.treasuredata.com
 *    AWS Asia Pacific (Tokyo)  cdp-ap03.in.treasturedata.com ap03.in.treasuredata.com
 */
function configure (config) {
  config = _.isObject(config) ? config : {}
  this.client.cdpHost = config.cdpHost || 'cdp.in.treasuredata.com'
  return this
}

/**
 * @param {object} options - User Segment object
 * @param {string|array} options.audienceToken - Audience Token(s) for the userId
 * @property {object} options.keys - Key Value to be sent for this segment
 * @param {function} [success] - Callback for receiving the user key and segments
 * @param {function} [error] - Callback for when sending the event is unsuccessful
 *
 * @example <caption>N.B. This feature is not enabled on accounts by default, please contact support for more information.</caption>
 * var td = new Treasure({...})
 * var successCallback = function (values) {
 *   //values format => [... {
 *   //  key: {
 *   //    [key]:value
 *   //  },
 *   //  values: ["1234"],
 *   //  attributes: {
 *   //    age: 30
 *   //  },
 *   //} ... ]
 *
 *   // celebrate();
 * };
 * var errorCallback = function (error) {
 *   // cry();
 * };
 * td.fetchUserSegments({
 *   audienceToken: ['token1', 'token2'],
 *   keys: {
 *     someKey: 'someValue',
 *     someOtherKey: 'someOtherValue',
 *   }
 * }, successCallback, errorCallback)
 */
function fetchUserSegments (tokenOrConfig, successCallback, errorCallback) {
  var isConfigObject = _.isObject(tokenOrConfig) && !_.isArray(tokenOrConfig)
  var audienceToken = isConfigObject ? tokenOrConfig.audienceToken : tokenOrConfig
  var keys = (isConfigObject && tokenOrConfig.keys) || {}

  successCallback = successCallback || noop
  errorCallback = errorCallback || noop

  invariant(
    typeof audienceToken === 'string' || _.isArray(audienceToken),
    'audienceToken must be a string or array; received "' + audienceToken.toString() + '"'
  )

  invariant(
    _.isObject(keys),
    'keys must be an object; received "' + keys + '"'
  )

  var token = _.isArray(audienceToken) ? audienceToken.join(',') : audienceToken
  var keysName = _.keys(keys)
  var keysArray = []
  _.forEach(keysName, function (key) {
    keysArray.push(['key.', key, '=', keys[key]].join(''))
  })

  var keyString = keysArray.join('&')

  var url = 'https://' + this.client.cdpHost + '/cdp/lookup/collect/segments?version=2&token=' + token + (keyString && ('&' + keyString))

  api
    .get(url, {
      ignoreDefaultHeaders: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(successCallback)
    .catch(errorCallback)
}

/**
 * @param {object} options - Configuration object
 * @param {string} options.cdpHost - The host to use for the Personalization API, defaults to "profile-api.treasuredata.com"
 * @param {string} options.token - Audience token to use
 * @param {string} options.index - Index key, for example "td_client_id"
 * @param {function} [success] - Callback for receiving the user key and segments
 * @param {function} [error] - Callback for when sending the event is unsuccessful
 *
 * @example
 * var td = new Treasure({...})
 * var successCallback = function (values) {
 *    // values format
 *    // {
 *    //    "segments":[],
 *    //    "attributes":{},
 *    //    "event_data":{}
 *    // }
 * }
 *
 * var errorCallback = function (error) {
 *    console.error('Failed to find profile')
 * }
 *
 * td.lookupProfile({
 *  cdpHost: 'profile-api.treasuredata.com',
 *  token: 'xxxxxxxxxx',
 *  index: 'td_client_id'
 * }, successCallback, errorCallback)
*/
function lookupProfile (options, successCallback, errorCallback) {
  options = options || {}

  var cdpHost = options.cdpHost || 'profile-api.treasuredata.com'
  var token = options.token
  var index = options.index
  var params = []

  invariant(
    token && (_.isString(token) || _.isArray(token)),
    'token must be a string or an array, received "' + String(token) + '"'
  )

  invariant(
    index && (_.isString(index) || _.isArray(index)),
    'index must be a string or an array, received "' + String(index) + '"'
  )

  if (_.isArray(token) && _.isArray(index)) {
    var isValidArrays =
      !_.isEmpty(token) && !_.isEmpty(index) && token.length === index.length

    invariant(isValidArrays, 'tokens and indexes must have the same length')

    token.forEach(function (tokenValue, idx) {
      params.push(encodeURI(tokenValue) + '=' + encodeURI(index[idx]))
    })
  } else {
    params.push(encodeURI(token) + '=' + encodeURI(index))
  }

  var url = 'https://' + cdpHost + '/v1/profile/lookup?' + params.join('&')
  api
    .get(url, {
      ignoreDefaultHeaders: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(successCallback)
    .catch(errorCallback)
}

module.exports = {
  configure: configure,
  fetchUserSegments: fetchUserSegments,
  lookupProfile: lookupProfile
}
