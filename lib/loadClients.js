/**
 * Treasure Client Loader
 */

// Modules
var _ = require('./utils/lodash')

// Helpers
function applyToClient (client, method) {
  var _method = '_' + method
  if (client[_method]) {
    var arr = client[_method] || []
    while (arr.length) {
      client[method].apply(client, arr.shift())
    }
    delete client[_method]
  }
}

// Constants
var TREASURE_KEYS = [
  'init',
  'set',
  'blockEvents',
  'unblockEvents',
  'setSignedMode',
  'setAnonymousMode',
  'resetUUID',
  'addRecord',
  'fetchGlobalID',
  'trackPageview',
  'trackEvent',
  'trackClicks',
  'fetchUserSegments',
  'fetchServerCookie',
  'ready'
]

/**
 * Load clients
 */
module.exports = function loadClients (Treasure, global, name) {
  if (_.isObject(global[name])) {
    var snippet = global[name]
    var clients = snippet.clients

    // Copy over Treasure.prototype functions over to snippet's prototype
    // This allows already-instanciated clients to work
    _.forIn(Treasure.prototype, function (value, key) {
      snippet.prototype[key] = value
    })

    // Iterate over each client instance
    _.forEach(clients, function (client) {
      // Call each key and with any stored values
      _.forEach(TREASURE_KEYS, function (value) {
        applyToClient(client, value)
      })
    })
  }
}
