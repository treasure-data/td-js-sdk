// module.exports = require('object.assign/polyfill')
var hasKey = require('./hasKey')

module.exports = Object.assign || /* istanbul ignore next: polyfill */ function assign (target, source1) {
  if (target == null) {
    throw new TypeError('target must be an object')
  }

  var objTarget = Object(target)
  for (var s = 1; s < arguments.length; ++s) {
    var source = Object(arguments[s])
    for (var key in source) {
      if (hasKey(source, key)) {
        objTarget[key] = source[key]
      }
    }
  }

  return objTarget
}
