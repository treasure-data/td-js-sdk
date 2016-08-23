// base64 encode a string
// Originally from https://github.com/keen/keen-js/blob/master/src/core/utils/base64.js
var cc = String.fromCharCode
var m = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

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

// function decode (n) {
//   var o = ''
//   var i = 0
//   var e1, e2, e3, e4, c1, c2, c3
//   // n = n.replace(/[^A-Za-z0-9\+\/\=]/g, '')
//   n = n.replace(/[^A-Za-z0-9\+\/=]/g, '')
//   while (i < n.length) {
//     e1 = m.indexOf(n.charAt(i++))
//     e2 = m.indexOf(n.charAt(i++))
//     e3 = m.indexOf(n.charAt(i++))
//     e4 = m.indexOf(n.charAt(i++))
//     c1 = (e1 << 2) | (e2 >> 4)
//     c2 = ((e2 & 15) << 4) | (e3 >> 2)
//     c3 = ((e3 & 3) << 6) | e4
//     o = o + (cc(c1) + ((e3 !== 64) ? cc(c2) : '')) + (((e4 !== 64) ? cc(c3) : ''))
//   }
//   return utf8Decode(o)
// }

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

// function utf8Decode (n) {
//   var o = ''
//   var i = 0
//   var c
//   while (i < n.length) {
//     c = n.charCodeAt(i)
//     o = o + ((c < 128)
//       ? [cc(c), i++][0]
//       : ((c > 191) && (c < 224))
//         ? [cc(((c & 31) << 6) | ((n.charCodeAt(i + 1)) & 63)), (i += 2)][0]
//         : [cc(((c & 15) << 12) | (((n.charCodeAt(i + 1)) & 63) << 6) | ((n.charCodeAt(i + 2)) & 63)), (i += 3)][0])
//   }
//   return o
// }

module.exports = {
  // decode: decode,
  encode: encode
  // utf8Decode: utf8Decode,
  // utf8Encode: utf8Encode
}
