var record = require('./record')
var _ = require('./utils/lodash')
var configurator = require('./configurator')

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
Treasure.version = Treasure.prototype.version = '1.5.2'

/**
 * Treasure#log
 */
Treasure.prototype.log = function () {
  var args = ['[Treasure]']
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
 */
_.mixin(Treasure.prototype, record)

/**
 * Treasure#_configurator
 */
Treasure.prototype._configurator = configurator

/**
 * Plugins
 */
Treasure.Plugins = {
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
