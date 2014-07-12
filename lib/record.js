'use strict';

/*!
* ---------------
* Treasure Record
* ---------------
*/

// Modules
var _ = require('./lodash'),
  url = require('url'),
  querystring = require('querystring'),
  superagent = require('superagent'),
  jsonp = require('jsonp');


// Helpers

/**
 * Object to Base64
 */
function objectToBase64(object) {
  return (new Buffer(JSON.stringify(object))).toString('base64');
}

/**
 * Validate record
 */
function validateRecord (table, record) {
  if (!_.isString(table)) {
    throw new Error('Must provide a table');
  }

  if (!(/^[a-z0-9_]{3,255}$/.test(table))) {
    throw new Error('Table must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _');
  }

  if (!_.isObject(record)) {
    throw new Error('Must provide a record');
  }

}

/**
 * Send record
 */
exports._sendRecord = function _sendRecord (request, success, error) {

  success = _.isFunction(success) ? success : _.noop;
  error = _.isFunction(error) ? error : _.noop;

  if (request.type === 'xhr') {
    superagent
      .post(request.url)
      .send(request.record)
      .set('X-TD-WRITE-KEY', request.apikey)
      .end(function(err, res) {
        if (err) {
          error(err);
        } else if (res.error) {
          error(res.error);
        } else if (res.body) {
          success(res.body);
        } else {
          success(res);
        }
      });

  } else if (request.type === 'jsonp') {
    var jsonpUrl = request.url + '?' + querystring.stringify({
      api_key: encodeURIComponent(request.apikey),
      data: encodeURIComponent(objectToBase64(request.record)),
      modified: encodeURIComponent(new Date().getTime())
    });
    jsonp(jsonpUrl, {
      prefix: 'TreasureJSONPCallback'
    }, function(err, res) {
      return err ? error(err) : success(res);
    });
  } else {
    throw new Error('Request type ' + request.type + ' not supported');
  }

};


// Methods

/**
 * Treasure#applyProperties
 *
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
exports.applyProperties = function applyProperties (table, payload) {
  var obj = {};
  _.assign(obj, this.get('$global'));
  _.assign(obj, this.get(table));
  _.assign(obj, payload);
  return obj;
};

/**
 * Treasure#addRecord
 *
 * Takes a table and a record
 *
 */
exports.addRecord = function addRecord (table, record, success, error) {
  validateRecord(table, record);

  var request = {
    url: url.resolve(this.client.endpoint, this.client.database + '/' + table),
    record: this.applyProperties(table, record),
    type: this.client.requestType,
    apikey: this.client.writeKey
  };

  if (this.client.development) {
    this.log('addRecord', request);
  } else {
    this._sendRecord(request, success, error);
  }

};


// Private functions, for testing only
exports._objectToBase64 = objectToBase64;
exports._validateRecord = validateRecord;
