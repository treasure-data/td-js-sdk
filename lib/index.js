/**
 * Treasure Index
 */
var Treasure = require('./treasure.js')
var window = require('global/window')
var GLOBAL = require('./config').GLOBAL

// Load all cached clients
require('./loadClients')(Treasure, GLOBAL)

// Expose the library on the window
window[GLOBAL] = Treasure
