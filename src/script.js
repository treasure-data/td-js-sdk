var window = require('global/window')
// var ready = require('./lib/ready')

// Expose createTreasure on the window
window['createTreasure'] = require('./createTreasure')

// // Load the global singleton if it's available
// ready(function () {
//   // window.transport = require('./transport')
//   // var globalName = window['TreasureObject'] || 'treasure'
//   // require('./loadClients')(globalName)
// })
