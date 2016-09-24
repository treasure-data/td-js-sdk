var forEach = require('./forEach')

/**
 * If the environment can use Object.defineProperty
 * Needed because of IE8
 * @const {boolean}
 */
var canDefineProperty = (function () {
  try {
    var o = {}
    Object.defineProperty(o, 'x', {
      configurable: true,
      enumerable: true,
      get: function () {
        return 1
      }
    })
    return o['x'] === 1
  } catch (e) {
    return false
  }
})()

/**
 * @param {!Object<string, *>} obj
 * @param {string} prop
 * @param {Function} fn
 * @return {!Object<string, *>}
 */
function setLazyProperty (obj, prop, fn) {
  if (canDefineProperty) {
    Object.defineProperty(obj, prop, {
      configurable: true,
      enumerable: true,
      get: fn
      // writable: true
    })
  } else {
    obj[prop] = fn()
  }
  return obj
}

/**
 * Define properties as getters on obj
 * Lets you lazily load modules
 * @param {!Object<string, *>} obj
 * @param {!Object<string, Function>} props
 * @return {!Object<string, *>}
 */
module.exports = function setLazy (obj, props) {
  forEach(props, function (fn, prop) {
    setLazyProperty(obj, prop, fn)
  })
  return obj
}
