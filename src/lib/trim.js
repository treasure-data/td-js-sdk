var isString = require('./isString')

/**
 * @param {*} value
 * @return {string}
 */
module.exports = function trim (value) {
  if (isString(value)) {
    var stringValue = /** @type {string} */ (value)
    return stringValue.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')
  } else {
    return ''
  }
}
