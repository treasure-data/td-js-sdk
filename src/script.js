var window = require('global/window')
var ready = require('./lib/ready')

// Expose createTreasure on the window
window['createTreasure'] = require('./createTreasure')

// Load the global client scaffold if it's available
ready(function () {
  // Default client is window.treasure
  // You can overwrite this by setting window.TreasureObject
  var name = window['TreasureObject'] || 'treasure'
  require('./loadClient')(name, window[name])
})
