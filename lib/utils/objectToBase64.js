/**
 * Convert an object to a base64 string
 */
var JSON3 = require('json3')
var toBase64 = require('./toBase64')

module.exports = function objectToBase64 (object) {
  return toBase64(JSON3.stringify(object))
}
