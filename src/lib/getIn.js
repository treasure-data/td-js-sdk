var hasKey = require('./hasKey')
var isObject = require('./isObject')

module.exports = function getIn (object, path, defaultValue) {
  if (!isObject(object) || !path) {
    return defaultValue
  }

  var currentValue = object
  var pathArray = path.split('.')
  for (var idx = 0; idx < pathArray; idx++) {
    var key = pathArray[idx]

    if (isObject(currentValue) && hasKey(currentValue, key)) {
      currentValue = currentValue[key]
      continue
    } else {
      currentValue = defaultValue
      break
    }
  }

  return currentValue
}
