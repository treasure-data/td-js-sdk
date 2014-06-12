  /*!
  * ----------------
  * Treasure Core JS
  * ----------------
  */

  /**
   * Creates a new Treasure logger
   * @constructor Treasure
   * @param {Object} config - Configuration object
   * @param {String} config.database - Database to which the events should get saved
   * @param {String} config.writeKey - Write-only API key for your account
   * @param {String} [config.protocol="auto"] - Protocol to use for url, allowed values: auto, http, https
   * @param {String} [config.requestType="auto"] - Request type for sending events, allowed values: auto, xhr, jsonp
   * @param {String} [config.host="in.treasuredata.com"] - Host to which events get sent
   */
  function Treasure() {
    return _init.apply(this, arguments);
  }

  function _validate(config) {
    if (_isUndefined(config)) {
      throw new Error('Check out our JavaScript SDK Usage Guide: http://docs.treasuredata.com/articles/javascript-sdk/');
    }
    if (_isUndefined(config.database) || _type(config.database) !== 'String' || !config.database.length) {
      throw new Error('Please provide a database');
    }
    if (!(/^[a-z0-9_]{3,255}$/.test(config.database))) {
      throw new Error('Database must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _');
    }
  }

  function _init(config) {
    _validate(config);
    this.configure(config);
  }

  Treasure.prototype.configure = function(config){
    _validate(config);
    config.host = (_isUndefined(config.host)) ? 'in.treasuredata.com' : config.host.replace(/.*?:\/\//g, '');
    config.protocol = _set_protocol(config.protocol);
    config.requestType = _set_request_type(config.requestType);

    this.client = {
      database: config.database,
      writeKey: config.writeKey,
      globalProperties: null,

      endpoint: config.protocol + '://' + config.host,
      requestType: config.requestType
    };

    Treasure.trigger('client', this, config);
    this.trigger('ready');

    return this;
  };


  // Private
  // --------------------------------

  function _extend(target){
    for (var i = 1; i < arguments.length; i++) {
      for (var prop in arguments[i]){
        // if ((target[prop] && _type(target[prop]) == 'Object') && (arguments[i][prop] && _type(arguments[i][prop]) == 'Object')){
        target[prop] = arguments[i][prop];
      }
    }
    return target;
  }

  function _isUndefined(obj) {
    return obj === void 0;
  }

  function _type(obj){
    var text = (obj && obj.constructor) ? obj.constructor.toString() : void 0;
	  return (text) ? text.match(/function (.*)\(/)[1] : 'Null';
  }

  function _each(o, cb, s){
    var n;
    if (!o){
      return 0;
    }
    s = !s ? o : s;
    if (_type(o)==='array'){ // is(o.length)
      // Indexed arrays, needed for Safari
      for (n=0; n<o.length; n++) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    } else {
      // Hashtables
      for (n in o){
        if (o.hasOwnProperty(n)) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      }
    }
    return 1;
  }

  function _parse_params(str){
    // via http://stackoverflow.com/a/2880929/2511985
    var urlParams = {},
        match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
        query  = str.split('?')[1];

    while (!!(match=search.exec(query))) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  }

  function _set_protocol(value) {
    value = value || 'auto';
    switch(value) {
      case 'http':
        return 'http';
      case 'https':
        return 'https';
      default:
        return location.protocol.replace(/:/g, '');
    }
  }

  function _set_request_type(value) {
    value = value || 'auto';
    if (value !== 'auto') {
      return value;
    } else {
      if ((_type(XMLHttpRequest)==='Object'||_type(XMLHttpRequest)==='Function') && 'withCredentials' in new XMLHttpRequest()) {
        return 'xhr';
      } else {
        return 'jsonp';
      }
    }
  }

  function _build_url(path) {
    return this.client.endpoint + '/js/v3/event/' + this.client.database + path;
  }

  var _request = {

    xhr: function(method, url, headers, body, apiKey, success, error){
      if (!apiKey) {
        return Treasure.log('Please provide an apikey from https://console.treasuredata.com/users/current');
      }
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            var response;
            try {
              response = JSON.parse(xhr.responseText);
            } catch (e) {
              Treasure.log('Could not JSON parse HTTP response: ' + xhr.responseText);
              if (error) {
                error(xhr, e);
              }
            }
            if (success && response) {
              success(response);
            }
          } else {
            Treasure.log('HTTP request failed.');
            if (error) {
              error(xhr, null); 
            }
          }
        }
      };
      xhr.open(method, url, true);
      if (apiKey) {
        xhr.setRequestHeader('X-TD-WRITE-KEY', apiKey);
      }
      if (body) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
      if (headers) {
        for (var headerName in headers) {
          if (headers.hasOwnProperty(headerName)) {
            xhr.setRequestHeader(headerName, headers[headerName]);
          }
        }
      }
      var toSend = body ? JSON.stringify(body) : null;
      xhr.send(toSend);
    },

    jsonp: function(url, apiKey, success, error){
      if (!apiKey) {
        return Treasure.log('Please provide an apikey from https://console.treasuredata.com/users/current');
      }
      if (apiKey && url.indexOf('api_key') < 0) {
        var delimiterChar = url.indexOf('?') > 0 ? '&' : '?';
        url = url + delimiterChar + 'api_key=' + apiKey;
      }

      var callbackName = 'TreasureJSONPCallback' + new Date().getTime();
      while (callbackName in window) {
        callbackName += 'a';
      }
      var loaded = false;
      window[callbackName] = function (response) {
        loaded = true;
        if (success && response) {
          success(response);
        }
        // Remove this from the namespace
        window[callbackName] = undefined;
      };
      url = url + '&callback=' + callbackName;
      var script = document.createElement('script');
      script.id = 'td-js-sdk-jsonp';
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
      // for early IE w/ no onerror event
      script.onreadystatechange = function() {
        if (loaded === false && this.readyState === 'loaded') {
          loaded = true;
          if (error) {
            error();
          }
        }
      };
      // non-ie, etc
      script.onerror = function() {
        if (loaded === false) { // on IE9 both onerror and onreadystatechange are called
          loaded = true;
          if (error) {
            error();
          }
        }
      };
    }

    // beacon: function(url, apiKey, success, error){
    //   if (apiKey && url.indexOf('api_key') < 0) {
    //     var delimiterChar = url.indexOf('?') > 0 ? '&' : '?';
    //     url = url + delimiterChar + 'api_key=' + apiKey;
    //   }
    //   var loaded = false, img = document.createElement('img');
    //   img.onload = function() {
    //     loaded = true;
    //     if ('naturalHeight' in this) {
    //       if (this.naturalHeight + this.naturalWidth === 0) {
    //         this.onerror(); return;
    //       }
    //     } else if (this.width + this.height === 0) {
    //       this.onerror(); return;
    //     }
    //     if (success) {
    //       success({created: true});
    //     }
    //   };
    //   img.onerror = function() {
    //     loaded = true;
    //     if (error) {
    //       error();
    //     }
    //   };
    //   img.src = url;
    // }
  };


  // -------------------------------
  // Treasure.Events
  // -------------------------------

  var Events = Treasure.Events = {
    on: function(name, callback) {
      this.listeners = this.listeners || {};
      var events = this.listeners[name] || (this.listeners[name] = []);
      events.push({callback: callback});
      return this;
    },
    off: function(name, callback) {
      if (!name && !callback) {
        this.listeners = void 0;
        delete this.listeners;
        return this;
      }
      var events = this.listeners[name] || [];
      for (var i = events.length; i--;) {
        if (callback && callback === events[i].callback) {
          this.listeners[name].splice(i, 1);
        }
        if (!callback || events.length === 0) {
          this.listeners[name] = void 0;
          delete this.listeners[name];
        }
      }
      return this;
    },
    trigger: function(name) {
      if (!this.listeners) {
        return this;
      }
      var args = Array.prototype.slice.call(arguments, 1);
      var events = this.listeners[name] || [];
      for (var i = 0; i < events.length; i++) {
        events[i].callback.apply(this, args);
      }
      return this;
    }
  };
  _extend(Treasure.prototype, Events);
  _extend(Treasure, Events);

  Treasure.loaded = true;

  // Expose utils
  Treasure.utils = {
    each: _each,
    extend: _extend,
    parseParams: _parse_params
  };

  Treasure.ready = function(callback){
    Treasure.on('ready', callback);
  };

  Treasure.log = function(message) {
    if (typeof console === 'object') {
      console.log('[Treasure]', message);
    }
  };

  // -------------------------------
  // Treasure.Plugins
  // -------------------------------

  // var Plugins = Treasure.Plugins = {};

