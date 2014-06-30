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


  // Applies all client._method items to client.method
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

        // Set global properties
        applyToClient(client, 'set');

        // Send queued events
        applyToClient(client, 'addRecord');

        // Create "on" Events
        applyToClient(client, 'on');
        client.trigger('ready');

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
