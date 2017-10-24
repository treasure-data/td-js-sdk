/**
 * Fake lodash
 * Only import the parts of lodash that I'm using to reduce bundle size
 */
module.exports = {
  // Collection
  forEach: require('lodash-compat/collection/forEach'),

  // Lang
  isNumber: require('lodash-compat/lang/isNumber'),
  isObject: require('lodash-compat/lang/isObject'),
  isString: require('lodash-compat/lang/isString'),
  isArray: function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]'
  },

  // Object
  assign: require('lodash-compat/object/assign'),
  forIn: require('lodash-compat/object/forIn'),
  keys: function (obj) {
    if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
      throw new TypeError('Object.keys called on non-object')
    }

    var result = []
    var prop
    var i

    for (prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop)
      }
    }

    if (hasDontEnumBug) {
      for (i = 0; i < dontEnumsLength; i++) {
        if (hasOwnProperty.call(obj, dontEnums[i])) {
          result.push(dontEnums[i])
        }
      }
    }
    return result
  },

  // Utility
  noop: require('lodash-compat/utility/noop')
}
