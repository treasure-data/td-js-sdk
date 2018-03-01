/**
  Author: github.com/duian
  Original Repo: https://github.com/duian/js-cookies
**/
/**
The MIT License (MIT)

Copyright (c) 2016 zhou

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/

/* eslint-disable no-useless-escape */

var encode = function encode (val) {
  try {
    return encodeURIComponent(val)
  } catch (e) {
    console.error('error encode %o')
  }
  return null
}

var decode = function decode (val) {
  try {
    return decodeURIComponent(val)
  } catch (err) {
    console.error('error decode %o')
  }
  return null
}

var handleSkey = function handleSkey (sKey) {
  return encode(sKey).replace(/[\-\.\+\*]/g, '\\$&')
}

var Cookies = {
  getItem: function getItem (sKey) {
    if (!sKey) {
      return null
    }
    return decode(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + handleSkey(sKey) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null
  },
  setItem: function setItem (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false
    }
    var sExpires = ''
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          if (vEnd === Infinity) {
            sExpires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
          } else {
            sExpires = '; max-age=' + vEnd
          }
          break

        case String:
          sExpires = '; expires=' + vEnd
          break

        case Date:
          sExpires = '; expires=' + vEnd.toUTCString()
          break

        default:
          break
      }
    }
    document.cookie = [ encode(sKey), '=', encode(sValue), sExpires, sDomain ? '; domain=' + sDomain : '', sPath ? '; path=' + sPath : '', bSecure ? '; secure' : '' ].join('')
    return true
  },
  removeItem: function removeItem (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) {
      return false
    }
    document.cookie = [ encode(sKey), '=; expires=Thu, 01 Jan 1970 00:00:00 GMT', sDomain ? '; domain=' + sDomain : '', sPath ? '; path=' + sPath : '' ].join('')
    return true
  },
  hasItem: function hasItem (sKey) {
    if (!sKey) {
      return false
    }
    return new RegExp('(?:^|;\\s*)' + encode(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(document.cookie)
  },
  keys: function keys () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/)
    aKeys = aKeys.map(function (key) {
      return decode(key)
    })
    return aKeys
  }
}

module.exports = Cookies
