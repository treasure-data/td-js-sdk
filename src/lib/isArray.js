module.exports = Array.isArray || function isArray (value) {
  return require('./isObject')(value) && Object.prototype.call(value) === '[object Array]'
}
