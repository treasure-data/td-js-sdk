var isString = require('./isString')

/**
 * @param {*} name
 * @return {boolean}
 */
module.exports = function isValidResourceName (name) {
  return isString(name) && /^[a-z0-9_]{3,255}$/.test(name)
}
