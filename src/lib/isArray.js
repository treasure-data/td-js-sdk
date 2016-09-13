/**
 * @param {*} value
 * @return {boolean}
 */
module.exports = Array.isArray || /* istanbul ignore next: polyfill */ function isArray (value) {
  return require('./isObject')(value) && Object.prototype.toString.call(value) === '[object Array]'
}
