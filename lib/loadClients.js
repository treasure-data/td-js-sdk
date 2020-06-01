/**
 * Treasure Client Loader
 */

// Modules
var _ = require('./utils/lodash')
var window = require('global/window')

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

function gatherClientHints () {
  var uaData = navigator.userAgentData
  var brands = uaData.brands || {}
  var clientHints = []

  _.forEach(brands, function (v, key) {
    clientHints.push([v.brand, v.version].join('/'))
  })

  var highEntropyPromise = uaData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion'])
  return highEntropyPromise.then(function (highEntropyValues) {
    var platform = highEntropyValues.platform
    var platformVersion = highEntropyValues.platformVersion
    var architecture = highEntropyValues.architecture
    var model = highEntropyValues.model
    var uaFullVersion = highEntropyValues.uaFullVersion

    if (platform) {
      clientHints.push(['Platform', platform].join('/'))
    }

    if (platformVersion) {
      clientHints.push(['PlatformVersion', platformVersion].join('/'))
    }

    if (architecture) {
      clientHints.push(['Architecture', architecture].join('/'))
    }

    if (model) {
      clientHints.push(['Model', model].join('/'))
    }

    if (uaFullVersion) {
      clientHints.push(['UAFullVersion', uaFullVersion].join('/'))
    }

    return clientHints.join(' ')
  })
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
module.exports = function loadClients (Treasure, name) {
  if (_.isObject(window[name])) {
    var snippet = window[name]
    var clients = snippet.clients

    // Copy over Treasure.prototype functions over to snippet's prototype
    // This allows already-instanciated clients to work
    _.forIn(Treasure.prototype, function (value, key) {
      snippet.prototype[key] = value
    })

    // Iterate over each client instance
    _.forEach(clients, function (client) {
      if (navigator.userAgentData) {
        gatherClientHints().then(function (clientHints) {
          client.clientHints = clientHints
          // Call each key and with any stored values
          _.forEach(TREASURE_KEYS, function (value) {
            applyToClient(client, value)
          })
        })
      } else {
        _.forEach(TREASURE_KEYS, function (value) {
          applyToClient(client, value)
        })
      }
    })
  }
}
