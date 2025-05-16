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
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(successCallback)
    .catch(errorCallback)
}

/**
* Fetch personalization information
*
* @param {object} config - configuration object
*   - endpoint - Personalization endpoint
*   - database - Database name
*   - table - table name
*   - token - personalization token
*
* @param {object} data - (Optional) payload to send with the request
* @param {function} successCallback - Callback for successful request
* @param {function} errorCallback - Callback for failed quest
*
* @example
* var td = new Treasure({...})
* var successCallback = function (values) {
*   //values format => {
*     "offers": {
*       "offer": {
*         "attributes": {
*           "first_name": "test",
*           "nickname": "tet"
*         },
*         "batch_segments": 55352
*       }
*      }
*    }
*
*   // celebrate();
* }
* var errorCallback = function (error) {
*   // cry();
* }
*
* td.fetchPersonalization({
*   endpoint: 'endpoint',
*   database: 'database',
*   table: 'table',
*   token: 'personalization token'
* }, null, successCallback, errorCallback)
*
*/

function fetchPersonalization(config, data, successCallback, errorCallback) {
  invariant(_.isObject(config), 'config must be an object, received "' + config + '"')
  invariant(config.endpoint, 'endpoint is invalid')
  invariant(config.database, 'database is invalid')
  invariant(config.table, 'table is invalid')
  invariant(config.token, 'token is invalid')

  successCallback = successCallback || noop
  errorCallback = errorCallback || noop

  var url = ['https://', config.endpoint, '/public/', config.database, '/', config.table].join('')

  var payload = data || {}
  api
    .post(url, payload, {
      headers: {
        'Content-Type': 'application/vnd.treasuredata.v1+json',
        'Authorization': 'TD1 ' + this.client.writeKey,
        'WP13n-Token': config.token
      }
    })
    .then(successCallback)
    .catch(errorCallback)
}

module.exports = {
  configure: configure,
  fetchUserSegments: fetchUserSegments,
  fetchPersonalization: fetchPersonalization
}
