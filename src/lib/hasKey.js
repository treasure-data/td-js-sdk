var objOwnProperty = Object.prototype.hasOwnProperty

/**
 * @param {*} object
 * @param {string} key
 * @return {boolean}
 */
module.exports = function hasKey (object, key) {
  return objOwnProperty.call(object, key)
}
