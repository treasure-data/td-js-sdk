'use strict';
/*jshint -W079 */

/*!
* --------------
* Treasure Index
* --------------
*/

// We should wait until the DOM is ready to run all our stuff
require('domReady')(function () {

  // Treasure library
  var Treasure = require('./treasure.js');

  // Load all cached clients
  require('./loadClients')(Treasure);

  if (typeof global.window.define === 'function' && global.window.define.amd) {
    global.window.define('Treasure', function () { return Treasure; });
  } else {
    global.window.Treasure = Treasure;
  }

});

