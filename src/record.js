  /*!
  * -------------------
  * Treasure Recorder JS
  * -------------------
  */

  Treasure.prototype.addRecord = function () {
    _uploadEvent.apply(this, arguments);
  };

  /* Treasure#set
   * Table value setter
   * When you set mutliple attributes, the object is iterated and values are set on the table
   * Attributes are not recursively set on the table
   *
   * Setting a single attribute
   * Example: td.set('table', 'foo', 'bar');
   *
   * Setting multiple properties at once
   * Example: td.set('table', {foo: 'bar', baz: 'qux'});
   *
   * Defaults to setting all attributes in $global
   * The following are equivalent:
   * td.set({foo: 'bar'}); == td.set('$global', {foo: 'bar'});
   *
   * Attributes in $global get applied to all tables
   *
   */
  Treasure.prototype.set = function (table, property, value) {
    if (typeof table === 'object') {
      property = table;
      table = '$global';
    }

    this.client.globals[table] = this.client.globals[table] || {};
    if (typeof property === 'object') {
      for (var prop in property) {
        if (property.hasOwnProperty(prop)) {
          this.client.globals[table][prop] = property[prop];
        }
      }
    } else {
      this.client.globals[table][property] = value;
    }

    return this;
  };

  /* Treasure#get
   * Table value getter
   *
   * Getting a single attribute
   * Example:
   * td.get('table', 'foo');
   * // > 'bar'
   *
   * Getting all attributes from a table
   * Example:
   * td.get('table');
   * // > {foo: 'bar'}
   *
   * Defaults to getting all attributes from $global
   * The following are equivalent:
   * td.get(); == td.get('$global');
   * // > {}
   *
   * If the table does not exist, its object gets created
   *
   */
  Treasure.prototype.get = function (table, key) {
    // If no table, show $global
    table = table || '$global';

    this.client.globals[table] = this.client.globals[table] || {};
    return key ? this.client.globals[table][key] : this.client.globals[table];
  };

  /* Treasure#applyProperties
   * Applies properties on a a payload object
   *
   * Starts with an empty object and applies properties in the following order:
   * $global -> table -> payload
   *
   * $global attributes are initially set on all objects
   * table attributes overwrite $global attributes for specific tables
   * payload attributes overwrite set $global and table attributes
   *
   * Expects a table name and a payload object as parameters
   * Returns a new object with all properties applied
   *
   * Example:
   * td.set('$global', 'foo', 'bar');
   * td.set('$global', 'bar', 'foo');
   * td.set('table', 'foo', 'foo');
   *
   * td.applyProperties('sales', {});
   * // > { foo: 'bar', bar: 'foo'}
   *
   * td.applyProperties('table', {});
   * // > { foo: 'foo', bar: 'foo'}
   *
   * td.applyProperties('table', {bar: 'bar'});
   * // > { foo: 'foo', bar: 'bar'}
   *
   * td.applyProperties('table', {foo: 'qux'});
   * // > { foo: 'qux', bar: 'foo'}
   *
   */
  Treasure.prototype.applyProperties = function (table, payload) {
    function applyOnObject (destination, source) {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          destination[prop] = source[prop];
        }
      }
      return destination;
    }

    var obj = {};
    obj = applyOnObject(obj, this.get('$global'));
    obj = applyOnObject(obj, this.get(table));
    obj = applyOnObject(obj, payload);
    return obj;
  };

  // Private for Treasure Recorder JS
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
    var jsonBody, base64Body;
    var newEvent = this.applyProperties(table, payload);

    // Add properties from user-defined event
    // for (var property in payload) {
    //   if (payload.hasOwnProperty(property)) {
    //     newEvent[property] = payload[property];
    //   }
    // }

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
