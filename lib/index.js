/**
 * Treasure Index
 */
var Treasure = require('./treasure.js')
var window = require('global/window')
var GLOBAL_NAME = require('./config').GLOBAL

var TD_GLOBAL = window

if (window.parent !== window && document.getElementById('td-iframe-async')) {
  TD_GLOBAL = window.parent
}

// Load all cached clients
require('./loadClients')(Treasure, TD_GLOBAL, GLOBAL_NAME)

// Expose the library on the window
TD_GLOBAL[GLOBAL_NAME] = Treasure
