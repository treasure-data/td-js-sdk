module.exports = function once (fn) {
  var hasBeenCalled = false
  return function onceCheck () {
    if (!hasBeenCalled) {
      hasBeenCalled = true
      fn()
    }
  }
}
