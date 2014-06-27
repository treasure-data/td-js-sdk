  /*!
  * ----------------------
  * Treasure Plugin
  * Async Loader
  * ----------------------
  */

  var loaded = window.Treasure,
      cached = window._Treasure || {},
      clients,
      ready;

  if (loaded && cached) {
    clients = cached.clients || {};
    ready = cached.ready || [];

    for (var instance in clients) {
      if (clients.hasOwnProperty(instance)) {
        var client = clients[instance];

        // Map methods to existing instances
        for (var method in Treasure.prototype) {
          if (Treasure.prototype.hasOwnProperty(method)) {
            loaded.prototype[method] = Treasure.prototype[method];
          }
        }

        // Run Configuration
        if (client._config) {
          client.configure.call(client, client._config);
          delete client._config;
        }

        // Add Global Properties
        if (client._setGlobalProperties) {
          var globals = client._setGlobalProperties;
          for (var i = 0; i < globals.length; i++) {
            client.setGlobalProperties.apply(client, globals[i]);
          }
          delete client._setGlobalProperties;
        }

        // Send Queued Events
        if (client._addRecord) {
          var queue = client._addRecord || [];
          for (var i = 0; i < queue.length; i++) {
            client.addRecord.apply(client, queue[i]);
          }
          delete client._addRecord;
        }

        // Create "on" Events
        var callback = client._on || [];
        if (client._on) {
          for (var i = 0; i < callback.length; i++) {
            client.on.apply(client, callback[i]);
          }
          client.trigger('ready');
          delete client._on;
        }

      }
    }

    var callbackGenerator = function(cb) {
      return function() {
        cb();
      };
    };
    for (var i = 0; i < ready.length; i++) {
      var callback = ready[i];
      Treasure.on('ready', callbackGenerator(callback));
    }
  }
