var forEach = require('./forEach')

/**
 * @param {string} url
 * @return {string}
 */
function queryParamSeparator (url) {
  return url.indexOf('?') === -1 ? '?' : '&'
}

/**
 * @param {!Object<string, (boolean|number|string)>} queryParams
 * @return {string}
 */
function urlencode (queryParams) {
  var params = []
  forEach(queryParams, function (value, key) {
    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })
  return params.join('&')
}

/**
 * @param {string} url
 * @param {!Object<string, (boolean|number|string)>} queryParams
 * @return {string}
 */
module.exports = function addQueryParams (url, queryParams) {
  return url + queryParamSeparator(url) + urlencode(queryParams)
}
