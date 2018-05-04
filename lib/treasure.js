var record = require('./record')
var _ = require('./utils/lodash')
var configurator = require('./configurator')
var version = require('./version')
var cookie = require('./vendor/js-cookies')
var config = require('./config')

function Treasure (options) {
  // enforces new
  if (!(this instanceof Treasure)) {
    return new Treasure(options)
  }

  this.init(options)
  return this
}

/**
 * Treasure#init
 */
Treasure.prototype.init = function (options) {
  this.configure(options)

  for (var plugin in Treasure.Plugins) {
    if (Treasure.Plugins.hasOwnProperty(plugin)) {
      Treasure.Plugins[plugin].configure.call(this, options)
    }
  }
}

/**
 * Treasure#version
 */
Treasure.version = Treasure.prototype.version = version

/**
 * Treasure#log
 */
Treasure.prototype.log = function () {
  var args = ['[' + config.GLOBAL + ']']
  for (var i = 0, len = arguments.length - 1; i <= len; i++) {
    args.push(arguments[i])
  }
  if (typeof console !== 'undefined' && this.client.logging) {
    console.log.apply(console, args)
  }
}

/**
 * Treasure#configure
 */
Treasure.prototype.configure = configurator.configure

/**
 * Treasure#set
 */
Treasure.prototype.set = configurator.set

/**
 * Treasure#get
 */
Treasure.prototype.get = configurator.get

/**
 * Treasure#ready
 */
Treasure.prototype.ready = require('domready')

/**
 * Treasure#applyProperties
 * Treasure#addRecord
 * Treasure#_sendRecord
 * Treasure#blockEvents
 * Treasure#unblockEvents
 * Treasure#areEventsBlocked
 * Treasure#setSignedMode
 * Treasure#setAnonymousMode
 * Treasure#inSignedMode
 */
Treasure.prototype.applyProperties = record.applyProperties
Treasure.prototype.addRecord = record.addRecord
Treasure.prototype._sendRecord = record._sendRecord
Treasure.prototype.blockEvents = record.blockEvents
Treasure.prototype.unblockEvents = record.unblockEvents
Treasure.prototype.areEventsBlocked = record.areEventsBlocked
Treasure.prototype.setSignedMode = record.setSignedMode
Treasure.prototype.setAnonymousMode = record.setAnonymousMode
Treasure.prototype.inSignedMode = record.inSignedMode

/**
 * Treasure#getCookie
 */
Treasure.prototype.getCookie = cookie.getItem

/**
 * Treasure#_configurator
 */
Treasure.prototype._configurator = configurator

/**
 * Plugins
 */
Treasure.Plugins = {
  Clicks: require('./plugins/clicks'),
  GlobalID: require('./plugins/globalid'),
  Personalization: require('./plugins/personalization'),
  Track: require('./plugins/track')
}

// Load all plugins
_.forIn(Treasure.Plugins, function (plugin) {
  _.forIn(plugin, function (method, name) {
    if (!Treasure.prototype[name]) {
      Treasure.prototype[name] = method
    }
  })
})

module.exports = Treasure
