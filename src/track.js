  /*!
  * -------------------
  * Treasure Tracker JS
  * -------------------
  */

  Treasure.prototype.addEvent = function() {
    _uploadEvent.apply(this, arguments);
  };

  /*
  Treasure.prototype.trackExternalLink = function(jsEvent, table, payload, timeout, timeoutCallback){

    var evt = jsEvent,
        newTab = evt.metaKey,
        target = evt.target,
        triggered = false,
        callback = function(){};

    if (timeout === undefined) {
      timeout = 500;
    }

    if (target.nodeName === "A") {
      callback = function(){
        if(!newTab && !triggered){
          triggered = true;
          window.location = target.href;
        }
      };
    } else if (target.nodeName === "FORM") {
      callback = function(){
        if(!triggered){
          triggered = true;
          target.submit();
        }
      };
    }

    if (timeoutCallback) {
      callback = function(){
        if(!triggered){
          triggered = true;
          timeoutCallback();
        }
      };
    }
    _uploadEvent.call(this, table, payload, callback, callback);

    setTimeout(function() {
      callback();
    }, timeout);

    if (!newTab) {
      return false;
    }
  };
  */

  Treasure.prototype.setGlobalProperties = function(newGlobalProperties) {
    if (!this.client) {
      return Treasure.log('Check out our JavaScript SDK Usage Guide: http://docs.treasuredata.com/articles/javascript-sdk');
    }
    if (newGlobalProperties && typeof(newGlobalProperties) === 'function') {
      this.client.globalProperties = newGlobalProperties;
    } else {
      throw new Error('Invalid value for global properties: ' + newGlobalProperties);
    }
  };

  // Private for Treasure Tracker JS
  // -------------------------------

  function _uploadEvent(table, payload, success, error) {
    if (_isUndefined(table) || _type(table) !== 'String' || !table.length) {
      throw new Error('Please provide a table');
    }
    if (!(/^[a-z0-9_]{3,255}$/.test(table))) {
      throw new Error('Table must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _');
    }
    if (_isUndefined(payload) || _type(payload) !== 'Object' || !payload) {
      throw new Error('Please provide an event');
    }
    var url = _build_url.apply(this, ['/' + table]);
    var newEvent = {};
    var jsonBody, base64Body;

    // Add properties from client.globalProperties
    if (this.client.globalProperties) {
      newEvent = this.client.globalProperties(table) || {};
    }

    // Add properties from user-defined event
    for (var property in payload) {
      if (payload.hasOwnProperty(property)) {
        newEvent[property] = payload[property];
      }
    }

    // Send data
    switch(this.client.requestType){

      case 'xhr':
        _request.xhr.apply(this, ['POST', url, null, newEvent, this.client.writeKey, success, error]);
        break;

      case 'jsonp':
        jsonBody = JSON.stringify(newEvent);
        base64Body = Treasure.Base64.encode(jsonBody);
        url = url + '?api_key=' + encodeURIComponent(this.client.writeKey);
        url = url + '&data=' + encodeURIComponent(base64Body);
        url = url + '&modified=' + encodeURIComponent(new Date().getTime());
        _request.jsonp.apply(this, [url, this.client.writeKey, success, error]);
        break;

      // case 'beacon':
      //   jsonBody = JSON.stringify(newEvent);
      //   base64Body = Treasure.Base64.encode(jsonBody);
      //   url = url + '?api_key=' + encodeURIComponent(this.client.writeKey);
      //   url = url + '&data=' + encodeURIComponent(base64Body);
      //   url = url + '&modified=' + encodeURIComponent(new Date().getTime());
      //   url = url + '&c=clv1';
      //   _request.beacon.apply(this, [url, null, success, error]);
      //   break;

    }
  }
