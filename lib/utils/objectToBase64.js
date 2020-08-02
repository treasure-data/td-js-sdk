/**
 * Convert an object to a base64 string
 */
var toBase64 = require('./toBase64')

module.exports = function objectToBase64 (object) {
  return toBase64(JSON.stringify(object))
}
