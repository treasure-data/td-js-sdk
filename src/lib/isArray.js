module.exports = Array.isArray || /* istanbul ignore next: polyfill */ function isArray (value) {
  return require('./isObject')(value) && Object.prototype.call(value) === '[object Array]'
}
