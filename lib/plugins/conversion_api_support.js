var _ = require('../../lib/utils/lodash')

function getCookie(key) {
  var allCookies = collectCookies()
  return allCookies[key] || null
}

function getCookieByNamePrefix(prefix) {
  var allCookies = collectCookies()
  var allKeys = Object.keys(allCookies)

  return allKeys.reduce(function (acc, val) {
    if (val.startsWith(prefix)) {
      acc[val] = allCookies[val]
    }

    return acc
  }, {})
}

function collectCookies() {
  var cookies = document.cookie
  if (!cookies) return {}

  return cookies.split(';').reduce(function (acc, val) {
    var keyValuePair = val.split('=')

    acc[keyValuePair[0].trim()] = keyValuePair[1]
    return acc
  }, {})
}

function getParam(key) {
  var queryString = window.location.search
  var urlParams = new URLSearchParams(queryString)

  return urlParams.get(key)
}

exports.configure = function () {}

// Google
var getGoogle_gclid_Param = function () {
  return {
    gclid: getParam('gclid')
  }
}

var getGoogle_wbraid_Param = function () {
  return {
    wbraid: getParam('wbraid')
  }
}

var getGoogle_ga_Cookie = function () {
  return {
    _ga: getCookie('_ga')
  }
}

var getGoogle_gcl_Cookies = function (options) {
  var prefix = options.gclPrefix || '_gcl'
  return getCookieByNamePrefix(prefix)
}

// Facebook
var getFacebook_fbp_Cookie = function () {
  return {
    _fbp: getCookie('_fbp')
  }
}

var getFacebook_fbc_Cookie = function () {
  return {
    _fbc: getCookie('_fbc')
  }
}

var getFacebook_fbclid_Param = function () {
  return {
    fbclid: getParam('fbclid')
  }
}

// Instagram
var getInstagram_shbts_Cookie = function () {
  return {
    shbts: getCookie('shbts')
  }
}

var getInstagram_shbid_Cookie = function () {
  return {
    shbid: getCookie('shbid')
  }
}

var getInstagram_ds_user_id_Cookie = function () {
  return {
    ds_user_id: getCookie('ds_user_id')
  }
}

var getInstagram_ig_did_Cookie = function () {
  return {
    ig_did: getCookie('ig_did')
  }
}

// Yahoo!
var getYahoo_yclid_Param = function () {
  return {
    yclid: getParam('yclid')
  }
}

var getYahoo_yj_r_Param = function () {
  return {
    yj_r: getParam('yj_r')
  }
}

var getYahoo_ycl_yjad_Cookie = function () {
  return {
    _ycl_yjad: getCookie('_ycl_yjad')
  }
}

var getYahoo_yjr_yjad_Cookie = function () {
  return {
    _yjr_yjad: getCookie('_yjr_yjad')
  }
}

var getYahoo_yjsu_yjad_Cookie = function () {
  return {
    _yjsu_yjad: getCookie('_yjsu_yjad')
  }
}

// Line
var getLine_lt_cid_Cookie = function () {
  return {
    __lt_cid: getCookie('__lt__cid')
  }
}

var getLine_lt_sid_Cookie = function () {
  return {
    __lt_sid: getCookie('__lt__sid')
  }
}

var getLine_ldtag_cl_Param = function () {
  return {
    ldtag_cl: getParam('ldtag_cl')
  }
}

// Twitter (X)
var getX_twclid_Cookie = function () {
  return {
    _twclid: getCookie('_twclid')
  }
}

var getX_twclid_Param = function () {
  return {
    twclid: getParam('twclid')
  }
}

// Pinterest
var getPinterest_epik_Param = function () {
  return {
    epik: getParam('epik')
  }
}

var getPinterest_epik_Cookie = function () {
  return {
    _epik: getCookie('_epik')
  }
}

// Snapchat
var getSnapchat_sccid_Param = function () {
  return {
    ScCid: getParam('ScCid')
  }
}

// Tiktok
var getTiktok_ttp_Cookie = function () {
  return {
    _ttp: getCookie('_ttp')
  }
}

// Marketo
var getMarketo_mkto_trk_Cookie = function () {
  return {
    _mkto_trk: getCookie('_mkto_trk')
  }
}

// Tealium
var getTealium_utag_main_Cookie = function () {
  return {
    utag_main: getCookie('utag_main')
  }
}

var API = {
  getGoogle_gclid_Param,
  getGoogle_wbraid_Param,
  getGoogle_ga_Cookie,
  getGoogle_gcl_Cookies,
  getFacebook_fbp_Cookie,
  getFacebook_fbc_Cookie,
  getFacebook_fbclid_Param,
  getInstagram_shbts_Cookie,
  getInstagram_shbid_Cookie,
  getInstagram_ds_user_id_Cookie,
  getInstagram_ig_did_Cookie,
  getYahoo_yclid_Param,
  getYahoo_yj_r_Param,
  getYahoo_ycl_yjad_Cookie,
  getYahoo_yjr_yjad_Cookie,
  getYahoo_yjsu_yjad_Cookie,
  getLine_lt_cid_Cookie,
  getLine_lt_sid_Cookie,
  getLine_ldtag_cl_Param,
  getX_twclid_Param,
  getX_twclid_Cookie,
  getPinterest_epik_Param,
  getPinterest_epik_Cookie,
  getSnapchat_sccid_Param,
  getTiktok_ttp_Cookie,
  getMarketo_mkto_trk_Cookie,
  getTealium_utag_main_Cookie
}

var vendorFunctionMappings = {
  google_ads: ['getGoogle_gclid_Param', 'getGoogle_wbraid_Param'],
  google_ga: ['getGoogle_ga_Cookie'],
  google_mp: ['getGoogle_gcl_Cookies'],
  meta: [
    'getFacebook_fbp_Cookie',
    'getFacebook_fbc_Cookie',
    'getFacebook_fbclid_Param'
  ],
  instagram: [
    'getInstagram_shbts_Cookie',
    'getInstagram_shbid_Cookie',
    'getInstagram_ds_user_id_Cookie',
    'getInstagram_ig_did_Cookie'
  ],
  yahoojp_ads: [
    'getYahoo_yclid_Param',
    'getYahoo_yj_r_Param',
    'getYahoo_ycl_yjad_Cookie',
    'getYahoo_yjr_yjad_Cookie',
    'getYahoo_yjsu_yjad_Cookie'
  ],
  line: [
    'getLine_lt_cid_Cookie',
    'getLine_lt_sid_Cookie',
    'getLine_ldtag_cl_Param'
  ],
  x: ['getX_twclid_Param', 'getX_twclid_Cookie'],
  pinterest: ['getPinterest_epik_Param', 'getPinterest_epik_Cookie'],
  snapchat: ['getSnapchat_sccid_Param'],
  tiktok: ['getTiktok_ttp_Cookie'],
  marketo: ['getMarketo_mkto_trk_Cookie'],
  tealium: ['getTealium_utag_main_Cookie']
}

function collectTagsByVendors(vendors = [], options = {}) {
  return vendors.reduce(function (acc, val) {
    var fnNames = vendorFunctionMappings[val] || []
    fnNames.forEach(function (fnName) {
      acc = Object.assign(acc, API[fnName].call(null, options))
    })
    return acc
  }, {})
}
function collectTagsByCookieNames(cookieNames = []) {
  return cookieNames.reduce(function (acc, val) {
    acc = Object.assign(acc, { [val]: getCookie(val) })
    return acc
  }, {})
}
function collectTagsByParamNames(params = []) {
  return params.reduce(function (acc, val) {
    acc = Object.assign(acc, { [val]: getParam(val) })
    return acc
  }, {})
}
function collectAllTags(options = {}) {
  var tags = {}

  var vendorKeys = Object.keys(vendorFunctionMappings)
  vendorKeys.forEach(function (vendor) {
    var vendorFns = vendorFunctionMappings[vendor]

    var vendorTags = vendorFns.reduce(function (acc, val) {
      acc = Object.assign(acc, API[val].call(null, options))
      return acc
    }, {})

    tags = Object.assign(tags, vendorTags)
  })

  // filter empty values
  return Object.keys(tags).reduce(function (acc, val) {
    if (tags[val]) {
      acc[val] = tags[val]
    }
    return acc
  }, {})
}
/**
 * Collect Ads cookies and parameters for Conversion APIs
 *
 * @param    {object}   configs - (Optional) object containing configuration information
 * @param    {object}   options - (Optional) object containing extra configurations
 *
 * Extra configurations only support Google Marketing Platform (Conversion Linker) for setting
 * custom cookie prefix
 *
 * @example
 * var td = new Treasure({...})
 * td.collectTags({
 *    vendors: ['meta', 'google_ga', 'google_mp'],
 *    cookies: ['_cookie_a', '_cookie_b'],
 *    params: ['paramA', 'paramB']
 * }, {
 *    gclPrefix: '_gcl2'
 * })
 *
 */
exports.collectTags = function (configs = {}, options = {}) {
  var isEmptyConfigValues =
    _.isEmpty(configs.vendors) &&
    _.isEmpty(configs.cookies) &&
    _.isEmpty(configs.params)

  var tags = {}

  if (_.isEmpty(configs) || isEmptyConfigValues) {
    tags = collectAllTags(options)
  } else {
    if (!_.isEmpty(configs.vendors)) {
      tags = Object.assign(tags, collectTagsByVendors(configs.vendors, options))
    }

    if (!_.isEmpty(configs.cookies)) {
      tags = Object.assign(tags, collectTagsByCookieNames(configs.cookies))
    }

    if (!_.isEmpty(configs.params)) {
      tags = Object.assign(tags, collectTagsByParamNames(configs.params))
    }
  }

  Object.keys(tags).forEach(
    function (tagKey) {
      this.set('$global', tagKey, tags[tagKey])
    }.bind(this)
  )
}
