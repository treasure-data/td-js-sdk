/**
 * @param {boolean} value
 * @param {string} message
 */
module.exports = function assert (value, message) {
  if (value !== true) {
    throw new Error(message)
  }
}
