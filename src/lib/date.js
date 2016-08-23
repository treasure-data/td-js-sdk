var now = Date.now || function now () {
  return +new Date()
}

module.exports = {
  now: now
}
