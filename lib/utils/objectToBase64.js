/**
 * Convert an object to a base64 string
 */
var JSON3 = require('json3')
var Base64 = require('Base64')

module.exports = function objectToBase64 (object) {
  return Base64.btoa(JSON3.stringify(object))
}
