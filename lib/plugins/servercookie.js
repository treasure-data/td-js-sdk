/**
 * Treasure Server Side Cookie
 */

var jsonp = require('jsonp')
var misc = require('../utils/misc')
var cookie = require('../vendor/js-cookies')

var noop = misc.noop
var cookieName = misc.sscCookieName

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
    if (typeof this.client.sscDomain === 'function') {
      this._serverCookieDomain = this.client.sscDomain()
    } else {
      this._serverCookieDomain = this.client.sscDomain
    }
    if (typeof this.client.sscServer === 'function') {
      this._serverCookieDomainHost = this.client.sscServer(this._serverCookieDomain)
    } else {
      this._serverCookieDomainHost = this.client.sscServer
    }
  }
  var url = 'https://' + this._serverCookieDomainHost + '/get_cookie_id?cookie_domain=' + window.encodeURI(this._serverCookieDomain) + '&r=' + new Date().getTime()
  var cachedSSCId = cookie.getItem(cookieName)
  if (cachedSSCId && !forceFetch) {
    return setTimeout(function () {
      success(cachedSSCId)
    }, 0)
  }

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
