'use strict';

/*!
* ----------------------
* Treasure Client Loader
* ----------------------
*/

// Modules
var _ = require('./lodash');

// Helpers
function applyToClient (client, method) {
  var _method = '_' + method;
  if (client[_method]) {
    var arr = client[_method] || [];
    while (arr.length) {
      client[method].apply(client, arr.shift());
    }
    delete client[_method];
  }
}

/**
 * Load clients
 */
module.exports = function loadClients (Treasure) {

  if (_.isObject(global.window) && _.isObject(global.window.Treasure)) {
    var snippet = global.window.Treasure || {},
      clients = snippet.clients || [];

    // Copy over Treasure.prototype functions over to snippet's prototype
    // This allows already-instanciated clients to work
    _.mixin(snippet.prototype, Treasure.prototype);

    _.each(clients, function (client) {

      _.each(['init', 'set', 'addRecord', 'trackPageview', 'trackEvent'], function (value) {
        applyToClient(client, value);
      });

    });

  }

};
