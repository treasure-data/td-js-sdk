/*
 * Treasure Server Side Cookie
 */

var noop = require('../utils/lodash').noop
var cookie = require('../vendor/js-cookies')
var setCookie = require('../utils/setCookie')
var api = require('../utils/xhr')

var cookieName = '_td_ssc_id'

function configure () {
  return this
}

/**
 * This functionality complies with ITP 1.2 tracking. Contact customer support for enabling this feature.
 *
 * @param {function} [success]    - Callback for when sending the event is successful
 * @param {function} [error]      - Callback for when sending the event is unsuccessful
 * @param {boolean}  [forceFetch] - Forces a refetch of server side id and ignores cached version (default false)
 *
 * @example
 * var td = new Treasure({...})
 * var successCallback = function (serverSideId) {
 *   // celebrate();
 * };
 * var errorCallback = function (error) {
 *   // cry();
 * }
 * td.fetchServerCookie(successCallback, errorCallback)
 */
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

  api.get(url, {
    ignoreDefaultHeaders: true
  })
    .then(function (res) {
      success(res.td_ssc_id)
    })
    .catch(error)
}

function removeServerCookie () {
  // remove server side cookie
  var domain
  if (Object.prototype.toString.call(this.client.sscDomain) === '[object Function]') {
    domain = this.client.sscDomain()
  } else {
    domain = this.client.sscDomain
  }
  setCookie({ domain: domain }, cookieName)
}

module.exports = {
  configure: configure,
  fetchServerCookie: fetchServerCookie,
  removeServerCookie: removeServerCookie
}
