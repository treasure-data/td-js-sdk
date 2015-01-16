'use strict';
/*jshint -W079 */

/*!
* --------------
* Treasure Index
* --------------
*/

// Treasure library
var Treasure = require('./treasure.js');

// Load all cached clients
require('./loadClients')(Treasure, 'Treasure');

module.exports = global.Treasure = Treasure;
