'use strict';

/**
 * LEGACY SUPPORT
 *
 * you must require 'es5-shim' and 'json3'
 * if you need legacy support for older browsers
 * must be required before Treasure and loadClients
 * must add es5-shim and json3 dependencies to package.json if used
 */
// require('es5-shim'); // ES5
// require('json3'); // JSON

/**
 * td-js-sdk
 *
 * require params would change in your repo to the following
 * '../../lib/treasure' => 'td-js-sdk'
 * '../../lib/loadClients' => 'td-js-sdk/lib/loadClients'
 */
var Example = require('../../../lib/treasure');
var loadClients = require('../../../lib/loadClients');

/**
 * CUSTOMIZATIONS
 *
 * DEFAULT_CONFIG is exposed by configurator
 * access it using Treasure.prototype._configurator.DEFAULT_CONFIG
 * set or modify any value and all instances will use it as the default
 * for more information look at td-js-sdk/lib/configurator.js
 */

// replace 'in.treasuredata.com' with 'in.example.com'
Example.prototype._configurator.DEFAULT_CONFIG.host = 'in.example.com';

// set default database to 'example'
Example.prototype._configurator.DEFAULT_CONFIG.database = 'example';

// load all existing clients from global.Example
// replace 'Example' with your own global
loadClients(Example, 'Example');

// export library and set globally
module.exports = global.Example = Example;
