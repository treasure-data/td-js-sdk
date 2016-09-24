var hasKey = require('./hasKey')
var isArray = require('./isArray')
var isObject = require('./isObject')

/**
 * @param {(Array<*>|Object<string, *>)} collection
 * @param {!(function (*, (number|string), (Array<*>|Object<string, *>)): void)} iteratee
 */
module.exports = function forEach (collection, iteratee) {
  if (isArray(collection)) {
    var length = collection.length
    for (var index = 0; index < length; index++) {
      iteratee(collection[index], index, collection)
    }
  } else if (isObject(collection)) {
    for (var key in collection) {
      /* istanbul ignore else */
      if (hasKey(collection, key)) {
        iteratee(collection[key], key, collection)
      }
    }
  } else {
    throw new TypeError('collection must be an object')
  }
}
