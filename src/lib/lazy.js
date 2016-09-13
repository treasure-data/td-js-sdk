var forEach = require('./forEach')

// If the environment can use Object.defineProperty
// Needed because of IE8...
var canDefineProperty = (function () {
  try {
    return Object.defineProperty({}, 'x', { get: function () { return 1 } }).x === 1
  } catch (e) {
    return false
  }
})()

// Use a getter to load object properties
// This enables you to only execute modules as needed
function setLazy (obj, prop, fn) {
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

// Similar to setLazy, but allows you to set multiple props at once
// props should be a map of property to getters
function setManyLazy (obj, props) {
  forEach(props, function (fn, prop) {
    setLazy(obj, prop, fn)
  })
  return obj
}

module.exports = {
  canDefineProperty: canDefineProperty,
  setLazy: setLazy,
  setManyLazy: setManyLazy
}
