var isString = require('./isString')

module.exports = function trim (value) {
  if (isString(value)) {
    return value.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')
  } else {
    return ''
  }
}
