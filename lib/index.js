'use strict';
/*jshint -W079 */

/*!
* --------------
* Treasure Index
* --------------
*/

require('es5-shim'); // Polyfill ES5
if (!global.window.JSON) {
  global.window.JSON = require('json3'); // Polyfill JSON
}

// Treasure library
var Treasure = require('./treasure.js');

// Load all cached clients
require('./loadClients')(Treasure);

if (typeof global.window.define === 'function' && global.window.define.amd) {
  global.window.define('Treasure', function () { return Treasure; });
} else {
  global.window.Treasure = Treasure;
}
