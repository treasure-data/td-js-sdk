var window = require('global/window')

module.exports = function ready (fn) {
  if (window.document.readyState !== 'loading') {
    fn()
  } else if (window.document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn)
  } else if (window.document.attachEvent) {
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState !== 'loading') {
        fn()
      }
    })
  } else {
    throw new Error('unexpected environment')
  }
}
