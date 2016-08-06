// Load JSON3 if it's not available...
// This will probably only ever run with IE8
module.exports = function loadJSON3 (callback) {
  var script = global.document.createElement('script')

  if (script.readyState) {
    script.onreadystatechange = function () {
      if (this.readyState === 'loaded' || this.readyState === 'complete') {
        this.onreadystatechange = null
        done()
      }
    }
  } else {
    script.onerror = script.onload = function () {
      this.onerror = this.onload = null
      done()
    }
  }

  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js'
  document.getElementsByTagName('head')[0].appendChild(script)

  function done () {
    var err = global.JSON && global.JSON.stringify
      ? null
      : new Error('JSON.stringify required')
    callback(err)
  }
}
