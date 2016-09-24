/**
 * @param {!(function (): void)} fn
 * @return {!(function (): void)}
 */
module.exports = function once (fn) {
  var hasBeenCalled = false
  return function onceCheck () {
    if (!hasBeenCalled) {
      hasBeenCalled = true
      fn()
    }
  }
}
