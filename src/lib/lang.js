var objToString = Object.prototype.toString
var ARRAY_TAG = '[object Array]'
var FUNCTION_TAG = '[object Function]'
var STRING_TAG = '[object String]'
var MAX_SAFE_INTEGER = 9007199254740991

var isArray = Array.isArray || function isArray (value) {
  return isObjectLike(value) &&
    isLength(value.length) &&
    objToString.call(value) === ARRAY_TAG
}

function isFunction (value) {
  return isObject(value) && objToString.call(value) === FUNCTION_TAG
}

function isLength (value) {
  return typeof value === 'number' &&
    value > -1 &&
    value % 1 === 0 &&
    value <= MAX_SAFE_INTEGER
}

function isObject (value) {
  var type = typeof value
  return !!value &&
    (type === 'object' || type === 'function')
}

function isObjectLike (value) {
  return !!value &&
    typeof value === 'object'
}

function isString (value) {
  return typeof value === 'string' ||
    (isObjectLike(value) && objToString.call(value) === STRING_TAG)
}

function isUndefined (value) {
  return value === undefined
}

module.exports = {
  isArray: isArray,
  isFunction: isFunction,
  isLength: isLength,
  isObject: isObject,
  isObjectLike: isObjectLike,
  isString: isString,
  isUndefined: isUndefined
}
