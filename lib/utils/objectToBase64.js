/**
 * Convert an object to a base64 string
 */
var global = require('global')
var JSON = global.JSON || require('json3')
var btoa = global.btoa || require('Base64').btoa

// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa#Unicode_Strings
module.exports = function objectToBase64 (object) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(object))))
}
