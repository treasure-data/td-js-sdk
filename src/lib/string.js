var isString = require('./lang').isString

function isValidResourceName (resource) {
  return isString(resource) && /^[a-z0-9_]{3,255}$/.test(resource)
}

function trim (value) {
  if (isString(value)) {
    return value.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '')
  } else {
    return ''
  }
}

module.exports = {
  isValidResourceName: isValidResourceName,
  trim: trim
}
