'use strict';

// Polyfill JSON
require('json3');

var _ = require('./lodash');

var configurator = require('./configurator'),
  record = require('./record');

/*jshint -W079 */
var Treasure = (function() {

  function Treasure (options) {
    // enforces new
    if (!(this instanceof Treasure)) {
      return new Treasure(options);
    }

    this.init(options);
    return this;
  }

  /**
   * Treasure#init
   */
  Treasure.prototype.init = function (options) {
    this.configure(options);

    for (var plugin in Treasure.Plugins) {
      Treasure.Plugins[plugin].configure.call(this, options);
    }
  };

  /**
   * Treasure#version
   */
  Treasure.version = Treasure.prototype.version = require('./version');

  /**
   * Treasure#log
   */
  Treasure.prototype.log = function () {
    var args = ['[Treasure]'];
    for (var i = 0, len = arguments.length - 1; i <= len; i++) {
      args.push(arguments[i]);
    }
    if (_.isObject(console) && this.client.logging) {
      console.log.apply(console, args);
    }
  };

  /**
   * Treasure#configure
   */
  Treasure.prototype.configure = configurator.configure;

  /**
   * Treasure#set
   */
  Treasure.prototype.set = configurator.set;

  /**
   * Treasure#get
   */
  Treasure.prototype.get = configurator.get;

  /**
   * Treasure#applyProperties
   * Treasure#addRecord
   * Treasure#_sendRecord
   */
  _.mixin(Treasure.prototype, record);

  // /**
  //  * Treasure#applyProperties
  //  */
  // Treasure.prototype.applyProperties = record.applyProperties;

  // /**
  //  * Treasure#addRecord
  //  */
  // Treasure.prototype.addRecord = record.addRecord;

  /**
   * Plugins
   */
  Treasure.Plugins = {
    Track: require('./plugins/track')
  };

  // Load all plugins
  _.forIn(Treasure.Plugins, function (plugin) {
    _.forIn(plugin, function (method, name) {
      if (!Treasure.prototype[name]) {
        Treasure.prototype[name] = method;
      }
    });
  });

  return Treasure;

}());

module.exports = Treasure;
