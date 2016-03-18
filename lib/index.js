/**
 * Treasure Index
 */
var Treasure = require('./treasure.js')
var window = require('global/window')

// Load all cached clients
require('./loadClients')(Treasure, 'Treasure')

// Expose the library on the window
window.Treasure = Treasure
