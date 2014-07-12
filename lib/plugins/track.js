'use strict';

/*!
* ----------------------
* Treasure Tracker
* ----------------------
*/

// Modules
var _ = require('../lodash'),
  cookie = require('cookies-js'),
  verge = require('verge');


// Helpers

function trackPageObject () {
  return {
    location: window.location.protocol +
      '//' + window.location.hostname +
      window.location.pathname +
      window.location.search,
    page: window.location.pathname + window.location.search,
    title: window.document.title
  };
}

function configureValues (track, version) {
  track.values = track.values || {};

  _.defaults(track.values, {
    td_version: function () {
      return version;
    },
    td_client_id: function () {
      return track.uuid;
    },
    td_charset: function () {
      return document.characterSet || document.charset || '-';
    },
    td_title: function () {
      return document.title;
    },
    td_language: function () {
      var nav = window.navigator;
      return (nav && (nav.language || nav.browserLanguage) || '-').toLowerCase();
    },
    td_color: function () {
      return window.screen ? window.screen.colorDepth + '-bit' : '-';
    },
    td_screen: function () {
      return window.screen ? window.screen.width + 'x' + window.screen.height : '-';
    },
    td_viewport: function () {
      return verge.viewportW().toString() + 'x' + verge.viewportH().toString();
    },
    td_host: function () {
      return document.location.host;
    },
    td_ip: function () {
      return 'td_ip';
    },
    td_browser: function () {
      return 'td_browser';
    },
    td_browser_version: function () {
      return 'td_browser_version';
    },
    td_os: function () {
      return 'td_os';
    },
    td_os_version: function () {
      return 'td_os_version';
    }
  });

  return track.values;

}

function configureTrack (track) {
  track = track || {};

  _.defaults(track, {
    pageviews: 'pageviews',
    events: 'events',
    values: {}
  });

  return track;
}

function configureStorage (storage) {
  if (storage === false || storage === 'none') {
    return false;
  }

  storage = _.isObject(storage) ? storage : {};
  _.defaults(storage, {
    name: '_td',
    expiration: 63072000,
    domain: document.location.hostname
  });

  if (storage.domain === 'none') {
    storage.domain = undefined;
  }

  return storage;
}

// Maybe look into a more legit solution later
// node-uuid doesn't work with old IE's
// Source: http://stackoverflow.com/a/8809472
function generateUUID () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c==='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

/**
 * Track#configure
 *
 * config (Object) - configuration object
 * config.storage (Object|Boolean)
 *    - when false it'll disable storage
 *    - when true it'll use defaults
 *    - when object it will overwrite defaults
 * config.storage.name (String)
 *    - cookie name
 *    - defaults to _td
 * config.storage.expiration (Number)
 *    - cookie duration in seconds
 *    - when 0 no cookie gets set
 *    - defaults to 63072000 (2 years)
 * config.storage.domain (String)
 *    - domain on which to set the cookie
 *    - when 'none' it will use browser default
 *    - defaults to document.location.hostname
 * config.track (Object)
 *    - tracking configuration object
 * config.track.pageviews (String)
 *    - default pageviews table name
 *    - defaults to 'pageviews'
 * config.track.events (String)
 *    - default events table name
 *    - defaults to 'events'
 *
 */
exports.configure = function configure (config) {

  // Object configuration for track and storage
  this.client.track = config.track = configureTrack(config.track);
  this.client.storage = config.storage = configureStorage(config.storage);

  // If clientId is not set, check cookies
  // If it's not set after checking cookies, generate a uuid and assign it
  if (_.isNumber(config.clientId)) {
    config.clientId = config.clientId.toString();
  } else if (!config.clientId || !_.isString(config.clientId)) {
    if (config.storage && config.storage.name) {
      config.clientId = cookie.get(config.storage.name);
    }
    if (!config.clientId) {
      config.clientId = generateUUID();
    }
  }
  this.client.track.uuid = config.clientId;

  // We only save cookies if storage is enabled and expiration is non-zero
  // Future work: save on top level domain that gets allowed
  // For example: www.google.com and foo.google.com, should save to google.com
  if (config.storage && config.storage.expiration) {
    cookie.expire(config.storage.name);
    cookie.set(config.storage.name, this.client.track.uuid);
  }

  // Values must be initialized later because they depend on knowing the uuid
  this.client.track.values = configureValues(this.client.track, this.version);

  return this;
};

/**
 * Track#trackEvent
 *
 * Like Treasure#addRecord, except that it'll include all track values
 *
 */
exports.trackEvent = function trackEvent (table, record, success, failure) {
  if (arguments.length === 0) {
    table = this.client.track.events;
  }

  record = record || {};
  _.defaults(record, this.getTrackValues());
  this.addRecord(table, record, success, failure);
  return this;
};

/**
 * Track#trackPageview
 *
 * Track impressions on your website
 * Will include location, page, and title
 *
 * Usage:
 * Treasure#trackPageview() - Sets table to default track pageviews
 * Treasure#trackPageview('foo') - Sets table to foo
 * Treasure#trackPageview({foo: 'foo'}) - Sets table to track pageviews and adds values to record
 * Treasure#trackPageview('foo', {}, success, failure) - Same as Treasure#addRecord
 *
 */
exports.trackPageview = function trackPageview (table, record, success, failure) {

  // When no arguments are passed, use default pageviews table
  if (arguments.length === 0) {
    table = this.client.track.pageviews;

  // When 1 param is passed and it's an object
  // shift the object over to the record
  // and set table to default pageviews
  } else if (arguments.length === 1 && _.isObject(table)) {
    record = table;
    table = this.client.track.pageviews;
  }

  record = record || {};
  _.defaults(record, this.getTrackValues());
  _.defaults(record, trackPageObject());
  this.addRecord(table, record, success, failure);

  return this;
};

/**
 * Track#getTrackValues
 *
 * Returns an object which executes all track value functions
 *
 */
exports.getTrackValues = function getTrackValues () {
  var result = {};
  _.forIn(this.client.track.values, function (value, key) {
    if (value) {
      if (_.isString(value)) {
        result[key] = value;
      } else if (_.isFunction(value)) {
        result[key] = value();
      }
    }
  });
  return result;
};

