  /*!
  * ----------------------
  * Treasure Tracker
  * ----------------------
  */

  Treasure.Plugins.Track = {
    /*
     *
     *
     *
     *
     */
    configure: function (instance, configuration) {
      configuration = configuration || {};
      configuration.track = configuration.track || {};
      if (!(instance instanceof Treasure)) {
        return; // Configuration error upstream
      }

      // Cookies
      var cookies = {
        name: '_td',
        expiration: 63072000,
        domain: document.location.hostname
      };
      cookies = configuration.storage !== 'none' ? cookies : false;


      if (cookies && typeof configuration.storage === 'object') {
        // Sets name to storage.name or _td
        cookies.name = configuration.storage.name || cookies.name;

        // If it's set to 'none', it won't set domain
        // Sets domain to strorage.domain or document.location.hostname
        if (typeof configuration.storage.domain === 'string') {
          cookies.domain = configuration.storage.domain === 'none' ? '' : configuration.storage.domain;
        }

        // If it's a number, try to set value to 0 or storage.expiration
        // Sets expiration to 63072000 by default, otherwise 0 or storage.expiration
        if (typeof configuration.storage.expiration === 'number') {
          cookies.expiration = configuration.storage.expiration === 0 ? 0 : (configuration.storage.expiration|0);
        }
      }

      var uuid = configuration.clientId ||
        (cookies ? Treasure.Cookies.get(cookies.name) : false) ||
        Treasure.UUID();

      // If cookies are enabled
      // And cookies are not set with expiration 0
      // And current cookie is different from uuid
      // Then we set the new uuid
      if (cookies && cookies.expiration && Treasure.Cookies.get(cookies.name) !== uuid) {
        Treasure.Cookies.expire(cookies.name, {
          domain: cookies.domain
        });
        Treasure.Cookies.set(cookies.name, uuid, {
          domain: cookies.domain,
          expires: cookies.expiration
        });
      }

      // Track
      var tdValuesObj = {
        td_version: function () {},
        td_client_id: function () {},
        td_charset: function () {},
        td_title: function () {},
        td_language: function () {},
        td_color: function () {},
        td_screen: function () {},
        td_host: function () {},
        td_ip: function () {},
        td_browser: function () {},
        td_browser_version: function () {},
        td_os: function () {},
        td_os_version: function () {}
      };

      for (var prop in configuration.track) {
        if (configuration.track.hasOwnProperty(prop)) {
          if (typeof configuration.track[prop] === 'function') {
            tdValuesObj[prop] = configuration.track[prop];
          } else {
            tdValuesObj[prop] = false;
          }
        }
      }

      // Initialize properties
      // pageview defaults to pageviews
      // event defaults to events
      instance.client.track = {
        pageviews: configuration.pageview || 'pageviews',
        events: configuration.event || 'events',
        uuid: uuid,
        tdValues: tdValuesObj,
        cookies: cookies
      };



      // var client = (instance instanceof Treasure) ? instance : false,
      //     config = configuration.pageviews || false,
      //     defaults, options, override_addons;

      // if (!client || (_type(config) !== 'Object' && _type(config) !== 'Boolean')) {
      //   return; // Configuration error somewhere upstream
      // }

      // defaults = {
      //   table: 'pageview',
      //   params: ['utm_content', 'utm_source', 'utm_medium', 'utm_term', 'utm_campaign'],
      //   data: {
      //     referrer: document.referrer,
      //     page: {
      //       title: document.title,
      //       host: document.location.host,
      //       href: document.location.href,
      //       path: document.location.pathname,
      //       protocol: document.location.protocol.replace(/:/g, ''),
      //       query: document.location.search
      //     }
      //   }
      // };

      // config = (typeof config !== 'undefined' && config !== null & _type(config) == 'Object') ? config : false;
      // config['data'] = (typeof config['data'] !== 'undefined' && config['data'] !== null && _type(config['data']) == 'Object') ? config['data'] : false;

      // if (config) {
      //   if (config['data']) {
      //     defaults['data'] = config['data'];
      //   } else {
      //     config['data'] = defaults['data'];
      //   }
      //   options = _extend(defaults, config);
      // } else {
      //   options = defaults;
      // }

      // // Get values for whitelisted params
      // // ----------------------------------
      // for (var i = 0; i < options['params'].length; i++) {
      //   var match = RegExp('[?&]' + options['params'][i] + '=([^&]*)').exec(document.location.search);
      //   var result = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
      //   if (result !== null) {
      //     options['data'][options['params'][i]] = result;
      //   }
      // }

      // // Set treasure.timestamp if it doesn't exist
      // // ---------------------------------------
      // options['data']['treasure'] = options['data']['treasure'] || {};
      // options['data']['treasure']['timestamp'] = options['data']['treasure']['timestamp'] || new Date().toISOString();

      // // Send pageview event
      // // ----------------------------------
      // //console.log('data', options['data']);
      // client.addRecord(options['table'], options['data']);
    }
  };

  Treasure.on('client', function () {
    Treasure.Plugins.Track.configure.apply(this, arguments);
  });
