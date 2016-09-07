module.exports = Date.now || function now () {
  return +new Date()
}
