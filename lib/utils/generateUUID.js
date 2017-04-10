// Maybe look into a more legit solution later
// node-uuid doesn't work with old IE's
// Source: http://stackoverflow.com/a/8809472

var window = require('global/window')

function S4 (num) {
  var ret = num.toString(16)
  while (ret.length < 4) {
    ret = '0' + ret
  }
  return ret
}

function cryptoUUID () {
  // If we have a cryptographically secure PRNG, use that
  // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
  var buf = new Uint16Array(8)
  window.crypto.getRandomValues(buf)
  return S4(buf[0]) +
      S4(buf[1]) +
      '-' +
      S4(buf[2]) +
      '-' +
      S4(buf[3]) +
      '-' +
      S4(buf[4]) +
      '-' +
      S4(buf[5]) +
      S4(buf[6]) +
      S4(buf[7])
}

function genericUUID () {
  // Otherwise, just use Math.random
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : r & 0x3 | 0x8
        return v.toString(16)
      }
    )
}

function isCryptoAvailable () {
  return typeof window.crypto !== 'undefined' &&
    typeof window.crypto.getRandomValues !== 'undefined'
}

module.exports = {
  isCryptoAvailable: isCryptoAvailable,
  cryptoUUID: cryptoUUID,
  genericUUID: genericUUID,
  uuid: isCryptoAvailable()
  ? cryptoUUID
  : genericUUID
}
