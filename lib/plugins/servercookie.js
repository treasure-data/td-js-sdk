/**
 * Treasure Server Side Cookie
 */

var jsonp = require('jsonp')
var noop = require('../utils/misc').noop
var invariant = require('../utils/misc').invariant
var cookie = require('../vendor/js-cookies')

var cookieName = '_td_ssc_id'

function configure () {
  return this
}

function fetchServerCookie (success, error, forceFetch) {
  success = success || noop
  error = error || noop

  var url = 'https://' + this.client.cookieDomainHost + '/get_cookie_id?cookie_domain=' + window.encodeURI(this.client.cookieDomain) + '&r=' + new Date().getTime()
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
      return err ? error(err) : success(res.td_ssc_id)
    }
  )
}

module.exports = {
  configure: configure,
  fetchServerCookie: fetchServerCookie
}
