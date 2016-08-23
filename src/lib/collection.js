var lang = require('./lang')
var object = require('./object')
var util = require('./util')

function forEach (collection, maybeIteratee) {
  var iteratee = lang.isFunction(maybeIteratee) ? maybeIteratee : util.identity

  if (lang.isArray(collection)) {
    var length = collection.length
    for (var index = 0; index < length; index++) {
      (0, iteratee)(collection[index], index, collection)
    }
  } else if (lang.isObject(collection)) {
    for (var key in collection) {
      if (object.hasKey(collection, key)) {
        (0, iteratee)(collection[key], key, collection)
      }
    }
  }

  return collection
}

module.exports = {
  forEach: forEach
}
