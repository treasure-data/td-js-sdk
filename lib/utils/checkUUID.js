var _ = require('./lodash')
module.exports = function (UUID) {
  if (!_.isString(UUID) || UUID.length < 10) {
    return false
  }
  var chars = {}
  _.forEach(UUID, function (char) {
    chars[char] = true
  })
  return Object.keys(chars).length > 8
}
