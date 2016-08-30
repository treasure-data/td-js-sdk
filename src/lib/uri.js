var forEach = require('./collection').forEach

function addQueryParams (url, queryParams) {
  return url + queryParamSeparator(url) + urlencode(queryParams)
}

// borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
// intentionally using regex and not <a/> href parsing trick because React Native and other
// environments where DOM might not be available
// function parseUrl (url) {
//   var match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/)
//   if (!match) {
//     return {}
//   }

//   // coerce to undefined values to empty string so we don't get 'undefined'
//   var query = match[6] || ''
//   var fragment = match[8] || ''
//   return {
//     protocol: match[2],
//     host: match[4],
//     path: match[5],
//     relative: match[5] + query + fragment // everything minus origin
//   }
// }

// function joinPaths (paths) {
//   var pathParts = ['']
//   forEach(paths, function (path) {
//     if (path && path !== '/') {
//       var length = path.length
//       var startIndex = path[0] === '/' ? 1 : 0
//       var endIndex = path[length - 1] === '/' ? length - 1 : length
//       pathParts.push(path.substring(startIndex, endIndex))
//     }
//   })
//   pathParts.push('')
//   return pathParts.join('/')
// }

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
  // parseUrl: parseUrl,
  // joinPaths: joinPaths,
  queryParamSeparator: queryParamSeparator,
  urlencode: urlencode
}
