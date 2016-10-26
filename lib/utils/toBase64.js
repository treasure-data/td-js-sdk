// Originally from https://github.com/keen/keen-js/blob/master/src/core/utils/base64.js
var cc = String.fromCharCode

/** @const {string} */
var m = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * base64 encode a string
 * @param {string} n
 * @return {string}
 */
function encode (n) {
  var o = ''
  var i = 0
  var i1, i2, i3, e1, e2, e3, e4
  n = utf8Encode(n)
  while (i < n.length) {
    i1 = n.charCodeAt(i++)
    i2 = n.charCodeAt(i++)
    i3 = n.charCodeAt(i++)
    e1 = (i1 >> 2)
    e2 = (((i1 & 3) << 4) | (i2 >> 4))
    e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6))
    e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63
    o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4)
  }
  return o
}

/**
 * @param {string} n
 * @return {string}
 */
function utf8Encode (n) {
  var o = ''
  var i = 0
  var c
  while (i < n.length) {
    c = n.charCodeAt(i++)
    o = o + ((c < 128)
      ? cc(c)
      : ((c > 127) && (c < 2048))
        ? (cc((c >> 6) | 192) + cc((c & 63) | 128))
        : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128))
    )
  }
  return o
}

module.exports = encode
