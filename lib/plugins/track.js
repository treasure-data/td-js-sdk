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
      return (document.characterSet || document.charset || '-').toLowerCase();
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
    td_title: function () {
      return document.title;
    },
    td_url: function () {
      var url = document.location.href;
      var i = url.indexOf('#');
      return -1 === i ? url : url.slice(0, i);
    },
    td_host: function () {
      return document.location.host;
    },
    td_path: function () {
      return document.location.pathname;
    },
    td_referrer: function () {
      return document.location.referrer;
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
  if (storage === 'none') {
    return false;
  }

  storage = _.isObject(storage) ? storage : {};
  _.defaults(storage, {
    name: '_td',
    expires: 63072000,
    domain: document.location.hostname
  });

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
 * config.storage (Object|String)
 *    - when object it will overwrite defaults
 * config.storage.name (String)
 *    - cookie name
 *    - defaults to _td
 * config.storage.expires (Number)
 *    - cookie duration in seconds
 *    - when 0 no cookie gets set
 *    - defaults to 63072000 (2 years)
 * config.storage.domain (String)
 *    - domain on which to set the cookie
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

  // Expire all domain cookies
  var expireCookie = function (storage) {
    var max = (storage.domain || '').split('.').length;
    for (var i = 0; i <= max; i++) {
      cookie.expire(storage.name);
    }
  };

  // Keep trying to set cookie on top level domain until it's allowed
  var setCookie = function (storage, uuid) {
    var clone = _.clone(storage);
    var max = storage.domain.split('.').length;
    for (var i = 0; i <= max; i++) {
      clone.domain = storage.domain.split('.').slice(0 - i);
      cookie(storage.name, uuid, clone);
      if (cookie.get(storage.name)) {
        break;
      }
    }
  };

  // Only save cookies if storage is enabled and expires is non-zero
  if (config.storage) {
    if (config.storage.expires) {
      expireCookie(config.storage);
      setCookie(config.storage, this.client.track.uuid);
    }
  }

  // Values must be initialized later because they depend on knowing the uuid
  _.defaults(this.client.track.values, configureValues(this.client.track, this.version));
  return this;
};

/**
 * Track#trackEvent
 *
 * Like Treasure#addRecord, except that it'll include all track values
 *
 */
exports.trackEvent = function trackEvent (table, record, success, failure) {

  // When no table, use default events table
  if (!table) {
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
 * Treasure#trackPageview(table, success, failure)
 *
 */
exports.trackPageview = function trackPageview (table, success, failure) {

  // When no table, use default pageviews table
  if (!table) {
    table = this.client.track.pageviews;
  }

  this.trackEvent(table, {}, success, failure);
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

