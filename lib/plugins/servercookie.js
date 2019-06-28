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
  if (!this.inSignedMode()) {
    return error('not in signed in mode')
  }
  if (!this.client.useServerSideCookie) {
    return error('server side cookie not enabled')
  }
  if (!this._serverCookieDomainHost) {
    if (typeof this.client.cookieDomain === 'function') {
      this._serverCookieDomain = this.client.cookieDomain()
    } else {
      this._serverCookieDomain = this.client.cookieDomain
    }
    if (typeof this.client.cookieDomainHost === 'function') {
      this._serverCookieDomainHost = this.client.cookieDomainHost(this._serverCookieDomain)
    } else {
      this._serverCookieDomainHost = this.client.cookieDomainHost
    }
  }
  var url = 'https://' + this._serverCookieDomainHost + '/get_cookie_id?cookie_domain=' + window.encodeURI(this._serverCookieDomain) + '&r=' + new Date().getTime()
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
