/** @return {number} */
module.exports = Date.now || /* istanbul ignore next: polyfill */ function now () {
  return +new Date()
}
