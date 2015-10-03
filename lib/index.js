/**
 * Treasure Index
 */

// Treasure library
var Treasure = require('./treasure.js')

// Load all cached clients
require('./loadClients')(Treasure, 'Treasure')

module.exports = Treasure
