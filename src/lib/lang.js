var isArray = Array.isArray || function isArray (value) {
  return isObject(value) && Object.prototype.call(value) === '[object Array]'
}

function isObject (value) {
  var type = typeof value
  return !!value &&
    (type === 'object' || type === 'function')
}

function isString (value) {
  return typeof value === 'string'
}

module.exports = {
  isArray: isArray,
  isObject: isObject,
  isString: isString
}
