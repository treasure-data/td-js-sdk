/**
 * Treasure Server Side Cookie
 */

var jsonp = require('jsonp')
var noop = require('../utils/misc').noop
var invariant = require('../utils/misc').invariant
var cookie = require('../vendor/js-cookies')

var cookieName = 'td_ssc_cookie'

function cacheSuccess (result, cookieName) {
  cookie.setItem(cookieName, result['td_ssc_id'], 6000)
  return result['td_ssc_id']
}

function configure (config) {
  if (config.useServerSideCookie) {
    cookie.getItem(cookieName)
  }
  return this
}

function fetchServerCookie (success, error, forceFetch) {
  success = success || noop
  error = error || noop

  var url = 'https://' + this.client.cookieDomainHost + '/get_cookie_id'

  var cachedSSCId = cookie.getItem(cookieName)
  if (cachedSSCId && !forceFetch) {
    return setTimeout(function () {
      success(cachedSSCId)
    }, 0)
  }

  invariant(
    this.client.requestType === 'jsonp',
    'Request type ' + this.client.requestType + ' not supported'
  )

  jsonp(
    url,
    {
      prefix: 'TreasureJSONPCallback',
      timeout: this.client.jsonpTimeout
    },
    function (err, res) {
      return err ? error(err) : success(cacheSuccess(res, cookieName))
    }
  )
}

module.exports = {
  configure: configure,
  cacheSuccess: cacheSuccess,
  fetchServerCookie: fetchServerCookie
}
