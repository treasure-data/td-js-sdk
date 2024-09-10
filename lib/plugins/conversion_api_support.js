var cookie = require('../vendor/js-cookies')

function getCookie(key) {
  return cookie.getItem(key)
}

function getParam(key) {
  var queryString = window.location.search
  var urlParams = new URLSearchParams(queryString)

  return urlParams.get(key)
}

exports.configure = function() {
}

exports.getGoogleClickIDParam = function() {
  return getParam('gclid')
}

exports.getGoogleAnalyticsCookie = function() {
  return getCookie('_ga')
}

exports.getGoogleConversionLinkerCookie = function() {
  return getCookie('_gcl_aw')
}

exports.getFacebook1stCookie = function() {
  return getCookie('_fbp')
}

exports.getFacebookClickIDCookie = function() {
  return getCookie('_fbc')
}

exports.getFacebookClickIDParam = function() {
  return getParam('fbclid')
}

exports.getYahooClickID_yclid_Param = function() {
  return getParam('yclid')
}

exports.getYahooClickID_yjr_yjad_Param = function() {
  return getParam('yjr_yjad')
}

exports.getYahooCAPICookie = function() {
  return getCookie('_yjsu_yjad')
}

exports.getYahooClickID_ycl_yjad_Cookie = function() {
  return getCookie('_ycl_yjad')
}

exports.getYahooClickID_yjr_yjad_Cookie = function() {
  return getCookie('_yjr_yjad')
}

exports.getXClickIDCookie = function() {
  return getCookie('_twclid')
}

exports.getLineCookie = function() {
  return getCookie('__lt__cid')
}

exports.getLineUserProfile = function() {
  if (!window.liff) throw new Error('LINE LIFF SDK is required. Please set it up to use this function! See https://developers.line.biz/en/docs/liff/developing-liff-apps')

  return new Promise(function(resolve, reject) {
    window.liff.ready.then(function() {
      if(!window.liff.isLoggedIn()) reject('Please login LINE using LIFF SDK first!')

      return window.liff.getProfile()
    }).then(function(profile) {
      resolve(profile)
    })
  })
}
