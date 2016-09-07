var forEach = require('./forEach')

function addQueryParams (url, queryParams) {
  return url + queryParamSeparator(url) + urlencode(queryParams)
}

function queryParamSeparator (url) {
  return url.indexOf('?') === -1 ? '?' : '&'
}

function urlencode (object) {
  var params = []
  forEach(object, function (value, key) {
    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
  })
  return params.join('&')
}

module.exports = {
  addQueryParams: addQueryParams,
  queryParamSeparator: queryParamSeparator,
  urlencode: urlencode
}
