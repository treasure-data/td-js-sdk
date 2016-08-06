/**
 * Convert an object to a base64 string
 */
var JSON3 = require('json3')

module.exports = function objectToBase64 (object) {
  return (new Buffer(JSON3.stringify(object))).toString('base64')
}
