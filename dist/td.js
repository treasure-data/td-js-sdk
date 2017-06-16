/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Treasure Index
	 */
	var Treasure = __webpack_require__(1)
	var window = __webpack_require__(58)

	// Load all cached clients
	__webpack_require__(64)(Treasure, 'Treasure')

	// Expose the library on the window
	window.Treasure = Treasure


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var record = __webpack_require__(2)
	var _ = __webpack_require__(8)
	var configurator = __webpack_require__(54)
	var version = __webpack_require__(55)

	function Treasure (options) {
	  // enforces new
	  if (!(this instanceof Treasure)) {
	    return new Treasure(options)
	  }

	  this.init(options)
	  return this
	}

	/**
	 * Treasure#init
	 */
	Treasure.prototype.init = function (options) {
	  this.configure(options)

	  for (var plugin in Treasure.Plugins) {
	    if (Treasure.Plugins.hasOwnProperty(plugin)) {
	      Treasure.Plugins[plugin].configure.call(this, options)
	    }
	  }
	}

	/**
	 * Treasure#version
	 */
	Treasure.version = Treasure.prototype.version = version

	/**
	 * Treasure#log
	 */
	Treasure.prototype.log = function () {
	  var args = ['[Treasure]']
	  for (var i = 0, len = arguments.length - 1; i <= len; i++) {
	    args.push(arguments[i])
	  }
	  if (typeof console !== 'undefined' && this.client.logging) {
	    console.log.apply(console, args)
	  }
	}

	/**
	 * Treasure#configure
	 */
	Treasure.prototype.configure = configurator.configure

	/**
	 * Treasure#set
	 */
	Treasure.prototype.set = configurator.set

	/**
	 * Treasure#get
	 */
	Treasure.prototype.get = configurator.get

	/**
	 * Treasure#ready
	 */
	Treasure.prototype.ready = __webpack_require__(56)

	/**
	 * Treasure#applyProperties
	 * Treasure#addRecord
	 * Treasure#_sendRecord
	 */
	Treasure.prototype.applyProperties = record.applyProperties
	Treasure.prototype.addRecord = record.addRecord
	Treasure.prototype._sendRecord = record._sendRecord

	/**
	 * Treasure#_configurator
	 */
	Treasure.prototype._configurator = configurator

	/**
	 * Plugins
	 */
	Treasure.Plugins = {
	  Clicks: __webpack_require__(57),
	  GlobalID: __webpack_require__(60),
	  Track: __webpack_require__(62)
	}

	// Load all plugins
	_.forIn(Treasure.Plugins, function (plugin) {
	  _.forIn(plugin, function (method, name) {
	    if (!Treasure.prototype[name]) {
	      Treasure.prototype[name] = method
	    }
	  })
	})

	module.exports = Treasure


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Treasure Record
	 */

	// Modules
	var invariant = __webpack_require__(3).invariant
	var noop = __webpack_require__(3).noop
	var jsonp = __webpack_require__(4)
	var _ = __webpack_require__(8)

	var objectToBase64 = __webpack_require__(49)

	// Helpers

	/**
	 * Validate record
	 */
	function validateRecord (table, record) {
	  invariant(
	    _.isString(table),
	    'Must provide a table'
	  )

	  invariant(
	    /^[a-z0-9_]{3,255}$/.test(table),
	    'Table must be between 3 and 255 characters and must ' +
	    'consist only of lower case letters, numbers, and _'
	  )

	  invariant(
	    _.isObject(record),
	    'Must provide a record'
	  )
	}

	/**
	 * Send record
	 */
	exports._sendRecord = function _sendRecord (request, success, error) {
	  success = success || noop
	  error = error || noop

	  invariant(
	    request.type === 'jsonp',
	    'Request type ' + request.type + ' not supported'
	  )

	  var params = [
	    'api_key=' + encodeURIComponent(request.apikey),
	    'modified=' + encodeURIComponent(new Date().getTime()),
	    'data=' + encodeURIComponent(objectToBase64(request.record))
	  ]

	  if (request.time) {
	    params.push('time=' + encodeURIComponent(request.time))
	  }

	  var jsonpUrl = request.url + '?' + params.join('&')
	  jsonp(jsonpUrl, {
	    prefix: 'TreasureJSONPCallback',
	    timeout: 10000 // 10 seconds timeout
	  }, function (err, res) {
	    return err ? error(err) : success(res)
	  })
	}

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
	 * td.set('$global', 'foo', 'bar')
	 * td.set('$global', 'bar', 'foo')
	 * td.set('table', 'foo', 'foo')
	 *
	 * td.applyProperties('sales', {})
	 * // > { foo: 'bar', bar: 'foo'}
	 *
	 * td.applyProperties('table', {})
	 * // > { foo: 'foo', bar: 'foo'}
	 *
	 * td.applyProperties('table', {bar: 'bar'})
	 * // > { foo: 'foo', bar: 'bar'}
	 *
	 * td.applyProperties('table', {foo: 'qux'})
	 * // > { foo: 'qux', bar: 'foo'}
	 *
	 */
	exports.applyProperties = function applyProperties (table, payload) {
	  return _.assign({}, this.get('$global'), this.get(table), payload)
	}

	/**
	 * Treasure#addRecord
	 *
	 * Takes a table and a record
	 *
	 */
	exports.addRecord = function addRecord (table, record, success, error) {
	  validateRecord(table, record)

	  var request = {
	    apikey: this.client.writeKey,
	    record: this.applyProperties(table, record),
	    time: null,
	    type: this.client.requestType,
	    url: this.client.endpoint + this.client.database + '/' + table
	  }

	  if (request.record.time) {
	    request.time = request.record.time
	  }

	  if (this.client.development) {
	    this.log('addRecord', request)
	  } else {
	    this._sendRecord(request, success, error)
	  }
	}

	// Private functions, for testing only
	exports._validateRecord = validateRecord


/***/ },
/* 3 */
/***/ function(module, exports) {

	function disposable (action) {
	  var disposed = false
	  return function dispose () {
	    if (!disposed) {
	      disposed = true
	      action()
	    }
	  }
	}

	function invariant (conditon, text) {
	  if (!conditon) {
	    throw new Error(text)
	  }
	}

	function noop () {}

	module.exports = {
	  disposable: disposable,
	  invariant: invariant,
	  noop: noop
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies
	 */

	var debug = __webpack_require__(5)('jsonp');

	/**
	 * Module exports.
	 */

	module.exports = jsonp;

	/**
	 * Callback index.
	 */

	var count = 0;

	/**
	 * Noop function.
	 */

	function noop(){}

	/**
	 * JSONP handler
	 *
	 * Options:
	 *  - param {String} qs parameter (`callback`)
	 *  - prefix {String} qs parameter (`__jp`)
	 *  - name {String} qs parameter (`prefix` + incr)
	 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
	 *
	 * @param {String} url
	 * @param {Object|Function} optional options / callback
	 * @param {Function} optional callback
	 */

	function jsonp(url, opts, fn){
	  if ('function' == typeof opts) {
	    fn = opts;
	    opts = {};
	  }
	  if (!opts) opts = {};

	  var prefix = opts.prefix || '__jp';

	  // use the callback name that was passed if one was provided.
	  // otherwise generate a unique name by incrementing our counter.
	  var id = opts.name || (prefix + (count++));

	  var param = opts.param || 'callback';
	  var timeout = null != opts.timeout ? opts.timeout : 60000;
	  var enc = encodeURIComponent;
	  var target = document.getElementsByTagName('script')[0] || document.head;
	  var script;
	  var timer;


	  if (timeout) {
	    timer = setTimeout(function(){
	      cleanup();
	      if (fn) fn(new Error('Timeout'));
	    }, timeout);
	  }

	  function cleanup(){
	    if (script.parentNode) script.parentNode.removeChild(script);
	    window[id] = noop;
	    if (timer) clearTimeout(timer);
	  }

	  function cancel(){
	    if (window[id]) {
	      cleanup();
	    }
	  }

	  window[id] = function(data){
	    debug('jsonp got', data);
	    cleanup();
	    if (fn) fn(null, data);
	  };

	  // add qs component
	  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
	  url = url.replace('?&', '?');

	  debug('jsonp req "%s"', url);

	  // create script
	  script = document.createElement('script');
	  script.src = url;
	  target.parentNode.insertBefore(script, target);

	  return cancel;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(6);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Use chrome.storage.local if we are in an app
	 */

	var storage;

	if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
	  storage = chrome.storage.local;
	else
	  storage = localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      storage.removeItem('debug');
	    } else {
	      storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(7);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Fake lodash
	 * Only import the parts of lodash that I'm using to reduce bundle size
	 */
	module.exports = {
	  // Collection
	  forEach: __webpack_require__(9),

	  // Lang
	  isNumber: __webpack_require__(38),
	  isObject: __webpack_require__(16),
	  isString: __webpack_require__(17),

	  // Object
	  assign: __webpack_require__(39),
	  forIn: __webpack_require__(46),

	  // Utility
	  noop: __webpack_require__(48)
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(10),
	    baseEach = __webpack_require__(11),
	    createForEach = __webpack_require__(35);

	/**
	 * Iterates over elements of `collection` invoking `iteratee` for each element.
	 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	 * (value, index|key, collection). Iteratee functions may exit iteration early
	 * by explicitly returning `false`.
	 *
	 * **Note:** As with other "Collections" methods, objects with a "length" property
	 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	 * may be used for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @alias each
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array|Object|string} Returns `collection`.
	 * @example
	 *
	 * _([1, 2]).forEach(function(n) {
	 *   console.log(n);
	 * }).value();
	 * // => logs each value from left to right and returns the array
	 *
	 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	 *   console.log(n, key);
	 * });
	 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	 */
	var forEach = createForEach(arrayEach, baseEach);

	module.exports = forEach;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(12),
	    createBaseEach = __webpack_require__(34);

	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	module.exports = baseEach;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(13),
	    keys = __webpack_require__(20);

	/**
	 * The base implementation of `_.forOwn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(14);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(15);

	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;

	    while ((fromRight ? index-- : ++index < length)) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(16),
	    isString = __webpack_require__(17),
	    support = __webpack_require__(19);

	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  if (support.unindexedChars && isString(value)) {
	    var index = -1,
	        length = value.length,
	        result = Object(value);

	    while (++index < length) {
	      result[index] = value.charAt(index);
	    }
	    return result;
	  }
	  return isObject(value) ? value : Object(value);
	}

	module.exports = toObject;


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(18);

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
	}

	module.exports = isString;


/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/** Used for native method references. */
	var arrayProto = Array.prototype,
	    errorProto = Error.prototype,
	    objectProto = Object.prototype;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;

	/**
	 * An object environment feature flags.
	 *
	 * @static
	 * @memberOf _
	 * @type Object
	 */
	var support = {};

	(function(x) {
	  var Ctor = function() { this.x = x; },
	      object = { '0': x, 'length': x },
	      props = [];

	  Ctor.prototype = { 'valueOf': x, 'y': x };
	  for (var key in new Ctor) { props.push(key); }

	  /**
	   * Detect if `name` or `message` properties of `Error.prototype` are
	   * enumerable by default (IE < 9, Safari < 5.1).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') ||
	    propertyIsEnumerable.call(errorProto, 'name');

	  /**
	   * Detect if `prototype` properties are enumerable by default.
	   *
	   * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	   * (if the prototype or a property on the prototype has been set)
	   * incorrectly set the `[[Enumerable]]` value of a function's `prototype`
	   * property to `true`.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.enumPrototypes = propertyIsEnumerable.call(Ctor, 'prototype');

	  /**
	   * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	   *
	   * In IE < 9 an object's own properties, shadowing non-enumerable ones,
	   * are made non-enumerable as well (a.k.a the JScript `[[DontEnum]]` bug).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.nonEnumShadows = !/valueOf/.test(props);

	  /**
	   * Detect if own properties are iterated after inherited properties (IE < 9).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.ownLast = props[0] != 'x';

	  /**
	   * Detect if `Array#shift` and `Array#splice` augment array-like objects
	   * correctly.
	   *
	   * Firefox < 10, compatibility modes of IE 8, and IE < 9 have buggy Array
	   * `shift()` and `splice()` functions that fail to remove the last element,
	   * `value[0]`, of array-like objects even though the "length" property is
	   * set to `0`. The `shift()` method is buggy in compatibility modes of IE 8,
	   * while `splice()` is buggy regardless of mode in IE < 9.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.spliceObjects = (splice.call(object, 0, 1), !object[0]);

	  /**
	   * Detect lack of support for accessing string characters by index.
	   *
	   * IE < 8 can't access characters by index. IE 8 can only access characters
	   * by index on string literals, not string objects.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';
	}(1, 0));

	module.exports = support;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(21),
	    isArrayLike = __webpack_require__(25),
	    isObject = __webpack_require__(16),
	    shimKeys = __webpack_require__(29),
	    support = __webpack_require__(19);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object == 'function' ? support.enumPrototypes : isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(22);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(23),
	    isHostObject = __webpack_require__(24),
	    isObjectLike = __webpack_require__(18);

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}

	module.exports = isNative;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(16);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	module.exports = isFunction;


/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	var isHostObject = (function() {
	  try {
	    Object({ 'toString': 0 } + '');
	  } catch(e) {
	    return function() { return false; };
	  }
	  return function(value) {
	    // IE < 9 presents many host objects as `Object` objects that can coerce
	    // to strings despite having improperly defined `toString` methods.
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  };
	}());

	module.exports = isHostObject;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(26),
	    isLength = __webpack_require__(28);

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	module.exports = isArrayLike;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(27);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(15);

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : toObject(object)[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 28 */
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(30),
	    isArray = __webpack_require__(31),
	    isIndex = __webpack_require__(32),
	    isLength = __webpack_require__(28),
	    isString = __webpack_require__(17),
	    keysIn = __webpack_require__(33);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object) || isString(object));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(25),
	    isObjectLike = __webpack_require__(18);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}

	module.exports = isArguments;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(21),
	    isLength = __webpack_require__(28),
	    isObjectLike = __webpack_require__(18);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};

	module.exports = isArray;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(10),
	    isArguments = __webpack_require__(30),
	    isArray = __webpack_require__(31),
	    isFunction = __webpack_require__(23),
	    isIndex = __webpack_require__(32),
	    isLength = __webpack_require__(28),
	    isObject = __webpack_require__(16),
	    isString = __webpack_require__(17),
	    support = __webpack_require__(19);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';

	/** Used to fix the JScript `[[DontEnum]]` bug. */
	var shadowProps = [
	  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	  'toLocaleString', 'toString', 'valueOf'
	];

	/** Used for native method references. */
	var errorProto = Error.prototype,
	    objectProto = Object.prototype,
	    stringProto = String.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/** Used to avoid iterating over non-enumerable properties in IE < 9. */
	var nonEnumProps = {};
	nonEnumProps[arrayTag] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	nonEnumProps[boolTag] = nonEnumProps[stringTag] = { 'constructor': true, 'toString': true, 'valueOf': true };
	nonEnumProps[errorTag] = nonEnumProps[funcTag] = nonEnumProps[regexpTag] = { 'constructor': true, 'toString': true };
	nonEnumProps[objectTag] = { 'constructor': true };

	arrayEach(shadowProps, function(key) {
	  for (var tag in nonEnumProps) {
	    if (hasOwnProperty.call(nonEnumProps, tag)) {
	      var props = nonEnumProps[tag];
	      props[key] = hasOwnProperty.call(props, key);
	    }
	  }
	});

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;

	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object) || isString(object)) && length) || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      proto = (isFunction(Ctor) && Ctor.prototype) || objectProto,
	      isProto = proto === object,
	      result = Array(length),
	      skipIndexes = length > 0,
	      skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error),
	      skipProto = support.enumPrototypes && isFunction(object);

	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  // lodash skips the `constructor` property when it infers it's iterating
	  // over a `prototype` object because IE < 9 can't set the `[[Enumerable]]`
	  // attribute of an existing property and the `constructor` property of a
	  // prototype defaults to non-enumerable.
	  for (var key in object) {
	    if (!(skipProto && key == 'prototype') &&
	        !(skipErrorProps && (key == 'message' || key == 'name')) &&
	        !(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  if (support.nonEnumShadows && object !== objectProto) {
	    var tag = object === stringProto ? stringTag : (object === errorProto ? errorTag : objToString.call(object)),
	        nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];

	    if (tag == objectTag) {
	      proto = objectProto;
	    }
	    length = shadowProps.length;
	    while (length--) {
	      key = shadowProps[length];
	      var nonEnum = nonEnums[key];
	      if (!(isProto && nonEnum) &&
	          (nonEnum ? hasOwnProperty.call(object, key) : object[key] !== proto[key])) {
	        result.push(key);
	      }
	    }
	  }
	  return result;
	}

	module.exports = keysIn;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(26),
	    isLength = __webpack_require__(28),
	    toObject = __webpack_require__(15);

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    var length = collection ? getLength(collection) : 0;
	    if (!isLength(length)) {
	      return eachFunc(collection, iteratee);
	    }
	    var index = fromRight ? length : -1,
	        iterable = toObject(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	module.exports = createBaseEach;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(36),
	    isArray = __webpack_require__(31);

	/**
	 * Creates a function for `_.forEach` or `_.forEachRight`.
	 *
	 * @private
	 * @param {Function} arrayFunc The function to iterate over an array.
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @returns {Function} Returns the new each function.
	 */
	function createForEach(arrayFunc, eachFunc) {
	  return function(collection, iteratee, thisArg) {
	    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	      ? arrayFunc(collection, iteratee)
	      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	  };
	}

	module.exports = createForEach;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(37);

	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;


/***/ },
/* 37 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(18);

	/** `Object#toString` result references. */
	var numberTag = '[object Number]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Number` primitive or object.
	 *
	 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	 * as numbers, use the `_.isFinite` method.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isNumber(8.4);
	 * // => true
	 *
	 * _.isNumber(NaN);
	 * // => true
	 *
	 * _.isNumber('8.4');
	 * // => false
	 */
	function isNumber(value) {
	  return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
	}

	module.exports = isNumber;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var assignWith = __webpack_require__(40),
	    baseAssign = __webpack_require__(41),
	    createAssigner = __webpack_require__(43);

	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object. Subsequent sources overwrite property assignments of previous sources.
	 * If `customizer` is provided it's invoked to produce the assigned values.
	 * The `customizer` is bound to `thisArg` and invoked with five arguments:
	 * (objectValue, sourceValue, key, object, source).
	 *
	 * **Note:** This method mutates `object` and is based on
	 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
	 *
	 * @static
	 * @memberOf _
	 * @alias extend
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	 * // => { 'user': 'fred', 'age': 40 }
	 *
	 * // using a customizer callback
	 * var defaults = _.partialRight(_.assign, function(value, other) {
	 *   return _.isUndefined(value) ? other : value;
	 * });
	 *
	 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	 * // => { 'user': 'barney', 'age': 36 }
	 */
	var assign = createAssigner(function(object, source, customizer) {
	  return customizer
	    ? assignWith(object, source, customizer)
	    : baseAssign(object, source);
	});

	module.exports = assign;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(20);

	/**
	 * A specialized version of `_.assign` for customizing assigned values without
	 * support for argument juggling, multiple sources, and `this` binding `customizer`
	 * functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 */
	function assignWith(object, source, customizer) {
	  var index = -1,
	      props = keys(source),
	      length = props.length;

	  while (++index < length) {
	    var key = props[index],
	        value = object[key],
	        result = customizer(value, source[key], key, object, source);

	    if ((result === result ? (result !== value) : (value === value)) ||
	        (value === undefined && !(key in object))) {
	      object[key] = result;
	    }
	  }
	  return object;
	}

	module.exports = assignWith;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(42),
	    keys = __webpack_require__(20);

	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return source == null
	    ? object
	    : baseCopy(source, keys(source), object);
	}

	module.exports = baseAssign;


/***/ },
/* 42 */
/***/ function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, props, object) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}

	module.exports = baseCopy;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(36),
	    isIterateeCall = __webpack_require__(44),
	    restParam = __webpack_require__(45);

	/**
	 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return restParam(function(object, sources) {
	    var index = -1,
	        length = object == null ? 0 : sources.length,
	        customizer = length > 2 ? sources[length - 2] : undefined,
	        guard = length > 2 ? sources[2] : undefined,
	        thisArg = length > 1 ? sources[length - 1] : undefined;

	    if (typeof customizer == 'function') {
	      customizer = bindCallback(customizer, thisArg, 5);
	      length -= 2;
	    } else {
	      customizer = typeof thisArg == 'function' ? thisArg : undefined;
	      length -= (customizer ? 1 : 0);
	    }
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, customizer);
	      }
	    }
	    return object;
	  });
	}

	module.exports = createAssigner;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(25),
	    isIndex = __webpack_require__(32),
	    isObject = __webpack_require__(16);

	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ },
/* 45 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);

	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}

	module.exports = restParam;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(13),
	    createForIn = __webpack_require__(47);

	/**
	 * Iterates over own and inherited enumerable properties of an object invoking
	 * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
	 * with three arguments: (value, key, object). Iteratee functions may exit
	 * iteration early by explicitly returning `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.forIn(new Foo, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
	 */
	var forIn = createForIn(baseFor);

	module.exports = forIn;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(36),
	    keysIn = __webpack_require__(33);

	/**
	 * Creates a function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {Function} objectFunc The function to iterate over an object.
	 * @returns {Function} Returns the new each function.
	 */
	function createForIn(objectFunc) {
	  return function(object, iteratee, thisArg) {
	    if (typeof iteratee != 'function' || thisArg !== undefined) {
	      iteratee = bindCallback(iteratee, thisArg, 3);
	    }
	    return objectFunc(object, iteratee, keysIn);
	  };
	}

	module.exports = createForIn;


/***/ },
/* 48 */
/***/ function(module, exports) {

	/**
	 * A no-operation function that returns `undefined` regardless of the
	 * arguments it receives.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.noop(object) === undefined;
	 * // => true
	 */
	function noop() {
	  // No operation performed.
	}

	module.exports = noop;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Convert an object to a base64 string
	 */
	var JSON3 = __webpack_require__(50)
	var toBase64 = __webpack_require__(53)

	module.exports = function objectToBase64 (object) {
	  return toBase64(JSON3.stringify(object))
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
	;(function () {
	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(52);

	  // A set of types used to distinguish objects from primitives.
	  var objectTypes = {
	    "function": true,
	    "object": true
	  };

	  // Detect the `exports` object exposed by CommonJS implementations.
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  // Use the `global` object exposed by Node (including Browserify via
	  // `insert-module-globals`), Narwhal, and Ringo as the default context,
	  // and the `window` object in browsers. Rhino exports a `global` function
	  // instead.
	  var root = objectTypes[typeof window] && window || this,
	      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

	  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
	    root = freeGlobal;
	  }

	  // Public: Initializes JSON 3 using the given `context` object, attaching the
	  // `stringify` and `parse` functions to the specified `exports` object.
	  function runInContext(context, exports) {
	    context || (context = root["Object"]());
	    exports || (exports = root["Object"]());

	    // Native constructor aliases.
	    var Number = context["Number"] || root["Number"],
	        String = context["String"] || root["String"],
	        Object = context["Object"] || root["Object"],
	        Date = context["Date"] || root["Date"],
	        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
	        TypeError = context["TypeError"] || root["TypeError"],
	        Math = context["Math"] || root["Math"],
	        nativeJSON = context["JSON"] || root["JSON"];

	    // Delegate to the native `stringify` and `parse` implementations.
	    if (typeof nativeJSON == "object" && nativeJSON) {
	      exports.stringify = nativeJSON.stringify;
	      exports.parse = nativeJSON.parse;
	    }

	    // Convenience aliases.
	    var objectProto = Object.prototype,
	        getClass = objectProto.toString,
	        isProperty, forEach, undef;

	    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	    var isExtended = new Date(-3509827334573292);
	    try {
	      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	      // results for certain dates in Opera >= 10.53.
	      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	        // Safari < 2.0.2 stores the internal millisecond time value correctly,
	        // but clips the values returned by the date methods to the range of
	        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	    } catch (exception) {}

	    // Internal: Determines whether the native `JSON.stringify` and `parse`
	    // implementations are spec-compliant. Based on work by Ken Snyder.
	    function has(name) {
	      if (has[name] !== undef) {
	        // Return cached feature test result.
	        return has[name];
	      }
	      var isSupported;
	      if (name == "bug-string-char-index") {
	        // IE <= 7 doesn't support accessing string characters using square
	        // bracket notation. IE 8 only supports this for primitives.
	        isSupported = "a"[0] != "a";
	      } else if (name == "json") {
	        // Indicates whether both `JSON.stringify` and `JSON.parse` are
	        // supported.
	        isSupported = has("json-stringify") && has("json-parse");
	      } else {
	        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	        // Test `JSON.stringify`.
	        if (name == "json-stringify") {
	          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	          if (stringifySupported) {
	            // A test function object with a custom `toJSON` method.
	            (value = function () {
	              return 1;
	            }).toJSON = value;
	            try {
	              stringifySupported =
	                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                // primitives as object literals.
	                stringify(0) === "0" &&
	                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                // literals.
	                stringify(new Number()) === "0" &&
	                stringify(new String()) == '""' &&
	                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	                // does not define a canonical JSON representation (this applies to
	                // objects with `toJSON` properties as well, *unless* they are nested
	                // within an object or array).
	                stringify(getClass) === undef &&
	                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	                // FF 3.1b3 pass this test.
	                stringify(undef) === undef &&
	                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	                // respectively, if the value is omitted entirely.
	                stringify() === undef &&
	                // FF 3.1b1, 2 throw an error if the given value is not a number,
	                // string, array, object, Boolean, or `null` literal. This applies to
	                // objects with custom `toJSON` methods as well, unless they are nested
	                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	                // methods entirely.
	                stringify(value) === "1" &&
	                stringify([value]) == "[1]" &&
	                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	                // `"[null]"`.
	                stringify([undef]) == "[null]" &&
	                // YUI 3.0.0b1 fails to serialize `null` literals.
	                stringify(null) == "null" &&
	                // FF 3.1b1, 2 halts serialization if an array contains a function:
	                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	                // elides non-JSON values from objects and arrays, unless they
	                // define custom `toJSON` methods.
	                stringify([undef, getClass, null]) == "[null,null,null]" &&
	                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	                // where character escape codes are expected (e.g., `\b` => `\u0008`).
	                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                stringify(null, value) === "1" &&
	                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	                // serialize extended years.
	                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	                // The milliseconds are optional in ES 5, but required in 5.1.
	                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	                // four-digit years instead of six-digit years. Credits: @Yaffle.
	                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	                // values less than 1000. Credits: @Yaffle.
	                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	            } catch (exception) {
	              stringifySupported = false;
	            }
	          }
	          isSupported = stringifySupported;
	        }
	        // Test `JSON.parse`.
	        if (name == "json-parse") {
	          var parse = exports.parse;
	          if (typeof parse == "function") {
	            try {
	              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	              // Conforming implementations should also coerce the initial argument to
	              // a string prior to parsing.
	              if (parse("0") === 0 && !parse(false)) {
	                // Simple parsing test.
	                value = parse(serialized);
	                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                if (parseSupported) {
	                  try {
	                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                    parseSupported = !parse('"\t"');
	                  } catch (exception) {}
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                      // certain octal literals.
	                      parseSupported = parse("01") !== 1;
	                    } catch (exception) {}
	                  }
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                      // points. These environments, along with FF 3.1b1 and 2,
	                      // also allow trailing commas in JSON objects and arrays.
	                      parseSupported = parse("1.") !== 1;
	                    } catch (exception) {}
	                  }
	                }
	              }
	            } catch (exception) {
	              parseSupported = false;
	            }
	          }
	          isSupported = parseSupported;
	        }
	      }
	      return has[name] = !!isSupported;
	    }

	    if (!has("json")) {
	      // Common `[[Class]]` name aliases.
	      var functionClass = "[object Function]",
	          dateClass = "[object Date]",
	          numberClass = "[object Number]",
	          stringClass = "[object String]",
	          arrayClass = "[object Array]",
	          booleanClass = "[object Boolean]";

	      // Detect incomplete support for accessing string characters by index.
	      var charIndexBuggy = has("bug-string-char-index");

	      // Define additional utility methods if the `Date` methods are buggy.
	      if (!isExtended) {
	        var floor = Math.floor;
	        // A mapping between the months of the year and the number of days between
	        // January 1st and the first of the respective month.
	        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	        // Internal: Calculates the number of days between the Unix epoch and the
	        // first day of the given month.
	        var getDay = function (year, month) {
	          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	        };
	      }

	      // Internal: Determines if a property is a direct property of the given
	      // object. Delegates to the native `Object#hasOwnProperty` method.
	      if (!(isProperty = objectProto.hasOwnProperty)) {
	        isProperty = function (property) {
	          var members = {}, constructor;
	          if ((members.__proto__ = null, members.__proto__ = {
	            // The *proto* property cannot be set multiple times in recent
	            // versions of Firefox and SeaMonkey.
	            "toString": 1
	          }, members).toString != getClass) {
	            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	            // supports the mutable *proto* property.
	            isProperty = function (property) {
	              // Capture and break the object's prototype chain (see section 8.6.2
	              // of the ES 5.1 spec). The parenthesized expression prevents an
	              // unsafe transformation by the Closure Compiler.
	              var original = this.__proto__, result = property in (this.__proto__ = null, this);
	              // Restore the original prototype chain.
	              this.__proto__ = original;
	              return result;
	            };
	          } else {
	            // Capture a reference to the top-level `Object` constructor.
	            constructor = members.constructor;
	            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	            // other environments.
	            isProperty = function (property) {
	              var parent = (this.constructor || constructor).prototype;
	              return property in this && !(property in parent && this[property] === parent[property]);
	            };
	          }
	          members = null;
	          return isProperty.call(this, property);
	        };
	      }

	      // Internal: Normalizes the `for...in` iteration algorithm across
	      // environments. Each enumerated key is yielded to a `callback` function.
	      forEach = function (object, callback) {
	        var size = 0, Properties, members, property;

	        // Tests for bugs in the current environment's `for...in` algorithm. The
	        // `valueOf` property inherits the non-enumerable flag from
	        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	        (Properties = function () {
	          this.valueOf = 0;
	        }).prototype.valueOf = 0;

	        // Iterate over a new instance of the `Properties` class.
	        members = new Properties();
	        for (property in members) {
	          // Ignore all properties inherited from `Object.prototype`.
	          if (isProperty.call(members, property)) {
	            size++;
	          }
	        }
	        Properties = members = null;

	        // Normalize the iteration algorithm.
	        if (!size) {
	          // A list of non-enumerable properties inherited from `Object.prototype`.
	          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	          // properties.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, length;
	            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
	            for (property in object) {
	              // Gecko <= 1.0 enumerates the `prototype` property of functions under
	              // certain conditions; IE does not.
	              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for each non-enumerable property.
	            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	          };
	        } else if (size == 2) {
	          // Safari <= 2.0.4 enumerates shadowed properties twice.
	          forEach = function (object, callback) {
	            // Create a set of iterated properties.
	            var members = {}, isFunction = getClass.call(object) == functionClass, property;
	            for (property in object) {
	              // Store each property name to prevent double enumeration. The
	              // `prototype` property of functions is not enumerated due to cross-
	              // environment inconsistencies.
	              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	          };
	        } else {
	          // No bugs detected; use the standard `for...in` algorithm.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	            for (property in object) {
	              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for the `constructor` property due to
	            // cross-environment inconsistencies.
	            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	              callback(property);
	            }
	          };
	        }
	        return forEach(object, callback);
	      };

	      // Public: Serializes a JavaScript `value` as a JSON string. The optional
	      // `filter` argument may specify either a function that alters how object and
	      // array members are serialized, or an array of strings and numbers that
	      // indicates which properties should be serialized. The optional `width`
	      // argument may be either a string or number that specifies the indentation
	      // level of the output.
	      if (!has("json-stringify")) {
	        // Internal: A map of control characters and their escaped equivalents.
	        var Escapes = {
	          92: "\\\\",
	          34: '\\"',
	          8: "\\b",
	          12: "\\f",
	          10: "\\n",
	          13: "\\r",
	          9: "\\t"
	        };

	        // Internal: Converts `value` into a zero-padded string such that its
	        // length is at least equal to `width`. The `width` must be <= 6.
	        var leadingZeroes = "000000";
	        var toPaddedString = function (width, value) {
	          // The `|| 0` expression is necessary to work around a bug in
	          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	          return (leadingZeroes + (value || 0)).slice(-width);
	        };

	        // Internal: Double-quotes a string `value`, replacing all ASCII control
	        // characters (characters with code unit values between 0 and 31) with
	        // their escaped equivalents. This is an implementation of the
	        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	        var unicodePrefix = "\\u00";
	        var quote = function (value) {
	          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
	          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	          for (; index < length; index++) {
	            var charCode = value.charCodeAt(index);
	            // If the character is a control character, append its Unicode or
	            // shorthand escape sequence; otherwise, append the character as-is.
	            switch (charCode) {
	              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	                result += Escapes[charCode];
	                break;
	              default:
	                if (charCode < 32) {
	                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                  break;
	                }
	                result += useCharIndex ? symbols[index] : value.charAt(index);
	            }
	          }
	          return result + '"';
	        };

	        // Internal: Recursively serializes an object. Implements the
	        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	          try {
	            // Necessary for host object support.
	            value = object[property];
	          } catch (exception) {}
	          if (typeof value == "object" && value) {
	            className = getClass.call(value);
	            if (className == dateClass && !isProperty.call(value, "toJSON")) {
	              if (value > -1 / 0 && value < 1 / 0) {
	                // Dates are serialized according to the `Date#toJSON` method
	                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                // for the ISO 8601 date time string format.
	                if (getDay) {
	                  // Manually compute the year, month, date, hours, minutes,
	                  // seconds, and milliseconds if the `getUTC*` methods are
	                  // buggy. Adapted from @Yaffle's `date-shim` project.
	                  date = floor(value / 864e5);
	                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                  date = 1 + date - getDay(year, month);
	                  // The `time` value specifies the time within the day (see ES
	                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                  // to compute `A modulo B`, as the `%` operator does not
	                  // correspond to the `modulo` operation for negative numbers.
	                  time = (value % 864e5 + 864e5) % 864e5;
	                  // The hours, minutes, seconds, and milliseconds are obtained by
	                  // decomposing the time within the day. See section 15.9.1.10.
	                  hours = floor(time / 36e5) % 24;
	                  minutes = floor(time / 6e4) % 60;
	                  seconds = floor(time / 1e3) % 60;
	                  milliseconds = time % 1e3;
	                } else {
	                  year = value.getUTCFullYear();
	                  month = value.getUTCMonth();
	                  date = value.getUTCDate();
	                  hours = value.getUTCHours();
	                  minutes = value.getUTCMinutes();
	                  seconds = value.getUTCSeconds();
	                  milliseconds = value.getUTCMilliseconds();
	                }
	                // Serialize extended years correctly.
	                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                  // Months, dates, hours, minutes, and seconds should have two
	                  // digits; milliseconds should have three.
	                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                  // Milliseconds are optional in ES 5.0, but required in 5.1.
	                  "." + toPaddedString(3, milliseconds) + "Z";
	              } else {
	                value = null;
	              }
	            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	              // ignores all `toJSON` methods on these objects unless they are
	              // defined directly on an instance.
	              value = value.toJSON(property);
	            }
	          }
	          if (callback) {
	            // If a replacement function was provided, call it to obtain the value
	            // for serialization.
	            value = callback.call(object, property, value);
	          }
	          if (value === null) {
	            return "null";
	          }
	          className = getClass.call(value);
	          if (className == booleanClass) {
	            // Booleans are represented literally.
	            return "" + value;
	          } else if (className == numberClass) {
	            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	            // `"null"`.
	            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	          } else if (className == stringClass) {
	            // Strings are double-quoted and escaped.
	            return quote("" + value);
	          }
	          // Recursively serialize objects and arrays.
	          if (typeof value == "object") {
	            // Check for cyclic structures. This is a linear search; performance
	            // is inversely proportional to the number of unique nested objects.
	            for (length = stack.length; length--;) {
	              if (stack[length] === value) {
	                // Cyclic structures cannot be serialized by `JSON.stringify`.
	                throw TypeError();
	              }
	            }
	            // Add the object to the stack of traversed objects.
	            stack.push(value);
	            results = [];
	            // Save the current indentation level and indent one additional level.
	            prefix = indentation;
	            indentation += whitespace;
	            if (className == arrayClass) {
	              // Recursively serialize array elements.
	              for (index = 0, length = value.length; index < length; index++) {
	                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                results.push(element === undef ? "null" : element);
	              }
	              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	            } else {
	              // Recursively serialize object members. Members are selected from
	              // either a user-specified list of property names, or the object
	              // itself.
	              forEach(properties || value, function (property) {
	                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                if (element !== undef) {
	                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                  // is not the empty string, let `member` {quote(property) + ":"}
	                  // be the concatenation of `member` and the `space` character."
	                  // The "`space` character" refers to the literal space
	                  // character, not the `space` {width} argument provided to
	                  // `JSON.stringify`.
	                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	                }
	              });
	              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	            }
	            // Remove the object from the traversed object stack.
	            stack.pop();
	            return result;
	          }
	        };

	        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	        exports.stringify = function (source, filter, width) {
	          var whitespace, callback, properties, className;
	          if (objectTypes[typeof filter] && filter) {
	            if ((className = getClass.call(filter)) == functionClass) {
	              callback = filter;
	            } else if (className == arrayClass) {
	              // Convert the property names array into a makeshift set.
	              properties = {};
	              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	            }
	          }
	          if (width) {
	            if ((className = getClass.call(width)) == numberClass) {
	              // Convert the `width` to an integer and create a string containing
	              // `width` number of space characters.
	              if ((width -= width % 1) > 0) {
	                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	              }
	            } else if (className == stringClass) {
	              whitespace = width.length <= 10 ? width : width.slice(0, 10);
	            }
	          }
	          // Opera <= 7.54u2 discards the values associated with empty string keys
	          // (`""`) only if they are used directly within an object member list
	          // (e.g., `!("" in { "": 1})`).
	          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	        };
	      }

	      // Public: Parses a JSON source string.
	      if (!has("json-parse")) {
	        var fromCharCode = String.fromCharCode;

	        // Internal: A map of escaped control characters and their unescaped
	        // equivalents.
	        var Unescapes = {
	          92: "\\",
	          34: '"',
	          47: "/",
	          98: "\b",
	          116: "\t",
	          110: "\n",
	          102: "\f",
	          114: "\r"
	        };

	        // Internal: Stores the parser state.
	        var Index, Source;

	        // Internal: Resets the parser state and throws a `SyntaxError`.
	        var abort = function () {
	          Index = Source = null;
	          throw SyntaxError();
	        };

	        // Internal: Returns the next token, or `"$"` if the parser has reached
	        // the end of the source string. A token may be a string, number, `null`
	        // literal, or Boolean literal.
	        var lex = function () {
	          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	          while (Index < length) {
	            charCode = source.charCodeAt(Index);
	            switch (charCode) {
	              case 9: case 10: case 13: case 32:
	                // Skip whitespace tokens, including tabs, carriage returns, line
	                // feeds, and space characters.
	                Index++;
	                break;
	              case 123: case 125: case 91: case 93: case 58: case 44:
	                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	                // the current position.
	                value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                Index++;
	                return value;
	              case 34:
	                // `"` delimits a JSON string; advance to the next character and
	                // begin parsing the string. String tokens are prefixed with the
	                // sentinel `@` character to distinguish them from punctuators and
	                // end-of-string tokens.
	                for (value = "@", Index++; Index < length;) {
	                  charCode = source.charCodeAt(Index);
	                  if (charCode < 32) {
	                    // Unescaped ASCII control characters (those with a code unit
	                    // less than the space character) are not permitted.
	                    abort();
	                  } else if (charCode == 92) {
	                    // A reverse solidus (`\`) marks the beginning of an escaped
	                    // control character (including `"`, `\`, and `/`) or Unicode
	                    // escape sequence.
	                    charCode = source.charCodeAt(++Index);
	                    switch (charCode) {
	                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                        // Revive escaped control characters.
	                        value += Unescapes[charCode];
	                        Index++;
	                        break;
	                      case 117:
	                        // `\u` marks the beginning of a Unicode escape sequence.
	                        // Advance to the first character and validate the
	                        // four-digit code point.
	                        begin = ++Index;
	                        for (position = Index + 4; Index < position; Index++) {
	                          charCode = source.charCodeAt(Index);
	                          // A valid sequence comprises four hexdigits (case-
	                          // insensitive) that form a single hexadecimal value.
	                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                            // Invalid Unicode escape sequence.
	                            abort();
	                          }
	                        }
	                        // Revive the escaped character.
	                        value += fromCharCode("0x" + source.slice(begin, Index));
	                        break;
	                      default:
	                        // Invalid escape sequence.
	                        abort();
	                    }
	                  } else {
	                    if (charCode == 34) {
	                      // An unescaped double-quote character marks the end of the
	                      // string.
	                      break;
	                    }
	                    charCode = source.charCodeAt(Index);
	                    begin = Index;
	                    // Optimize for the common case where a string is valid.
	                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                      charCode = source.charCodeAt(++Index);
	                    }
	                    // Append the string as-is.
	                    value += source.slice(begin, Index);
	                  }
	                }
	                if (source.charCodeAt(Index) == 34) {
	                  // Advance to the next character and return the revived string.
	                  Index++;
	                  return value;
	                }
	                // Unterminated string.
	                abort();
	              default:
	                // Parse numbers and literals.
	                begin = Index;
	                // Advance past the negative sign, if one is specified.
	                if (charCode == 45) {
	                  isSigned = true;
	                  charCode = source.charCodeAt(++Index);
	                }
	                // Parse an integer or floating-point value.
	                if (charCode >= 48 && charCode <= 57) {
	                  // Leading zeroes are interpreted as octal literals.
	                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                    // Illegal octal literal.
	                    abort();
	                  }
	                  isSigned = false;
	                  // Parse the integer component.
	                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                  // Floats cannot contain a leading decimal point; however, this
	                  // case is already accounted for by the parser.
	                  if (source.charCodeAt(Index) == 46) {
	                    position = ++Index;
	                    // Parse the decimal component.
	                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal trailing decimal.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Parse exponents. The `e` denoting the exponent is
	                  // case-insensitive.
	                  charCode = source.charCodeAt(Index);
	                  if (charCode == 101 || charCode == 69) {
	                    charCode = source.charCodeAt(++Index);
	                    // Skip past the sign following the exponent, if one is
	                    // specified.
	                    if (charCode == 43 || charCode == 45) {
	                      Index++;
	                    }
	                    // Parse the exponential component.
	                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal empty exponent.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Coerce the parsed value to a JavaScript number.
	                  return +source.slice(begin, Index);
	                }
	                // A negative sign may only precede numbers.
	                if (isSigned) {
	                  abort();
	                }
	                // `true`, `false`, and `null` literals.
	                if (source.slice(Index, Index + 4) == "true") {
	                  Index += 4;
	                  return true;
	                } else if (source.slice(Index, Index + 5) == "false") {
	                  Index += 5;
	                  return false;
	                } else if (source.slice(Index, Index + 4) == "null") {
	                  Index += 4;
	                  return null;
	                }
	                // Unrecognized token.
	                abort();
	            }
	          }
	          // Return the sentinel `$` character if the parser has reached the end
	          // of the source string.
	          return "$";
	        };

	        // Internal: Parses a JSON `value` token.
	        var get = function (value) {
	          var results, hasMembers;
	          if (value == "$") {
	            // Unexpected end of input.
	            abort();
	          }
	          if (typeof value == "string") {
	            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	              // Remove the sentinel `@` character.
	              return value.slice(1);
	            }
	            // Parse object and array literals.
	            if (value == "[") {
	              // Parses a JSON array, returning a new JavaScript array.
	              results = [];
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing square bracket marks the end of the array literal.
	                if (value == "]") {
	                  break;
	                }
	                // If the array literal contains elements, the current token
	                // should be a comma separating the previous element from the
	                // next.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "]") {
	                      // Unexpected trailing `,` in array literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each array element.
	                    abort();
	                  }
	                }
	                // Elisions and leading commas are not permitted.
	                if (value == ",") {
	                  abort();
	                }
	                results.push(get(value));
	              }
	              return results;
	            } else if (value == "{") {
	              // Parses a JSON object, returning a new JavaScript object.
	              results = {};
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing curly brace marks the end of the object literal.
	                if (value == "}") {
	                  break;
	                }
	                // If the object literal contains members, the current token
	                // should be a comma separator.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "}") {
	                      // Unexpected trailing `,` in object literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each object member.
	                    abort();
	                  }
	                }
	                // Leading commas are not permitted, object property names must be
	                // double-quoted strings, and a `:` must separate each property
	                // name and value.
	                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                  abort();
	                }
	                results[value.slice(1)] = get(lex());
	              }
	              return results;
	            }
	            // Unexpected token encountered.
	            abort();
	          }
	          return value;
	        };

	        // Internal: Updates a traversed object member.
	        var update = function (source, property, callback) {
	          var element = walk(source, property, callback);
	          if (element === undef) {
	            delete source[property];
	          } else {
	            source[property] = element;
	          }
	        };

	        // Internal: Recursively traverses a parsed JSON object, invoking the
	        // `callback` function for each value. This is an implementation of the
	        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	        var walk = function (source, property, callback) {
	          var value = source[property], length;
	          if (typeof value == "object" && value) {
	            // `forEach` can't be used to traverse an array in Opera <= 8.54
	            // because its `Object#hasOwnProperty` implementation returns `false`
	            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	            if (getClass.call(value) == arrayClass) {
	              for (length = value.length; length--;) {
	                update(value, length, callback);
	              }
	            } else {
	              forEach(value, function (property) {
	                update(value, property, callback);
	              });
	            }
	          }
	          return callback.call(source, property, value);
	        };

	        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	        exports.parse = function (source, callback) {
	          var result, value;
	          Index = 0;
	          Source = "" + source;
	          result = get(lex());
	          // If a JSON string contains multiple tokens, it is invalid.
	          if (lex() != "$") {
	            abort();
	          }
	          // Reset the parser state.
	          Index = Source = null;
	          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	        };
	      }
	    }

	    exports["runInContext"] = runInContext;
	    return exports;
	  }

	  if (freeExports && !isLoader) {
	    // Export for CommonJS environments.
	    runInContext(root, freeExports);
	  } else {
	    // Export for web browsers and JavaScript engines.
	    var nativeJSON = root.JSON,
	        previousJSON = root["JSON3"],
	        isRestored = false;

	    var JSON3 = runInContext(root, (root["JSON3"] = {
	      // Public: Restores the original value of the global `JSON` object and
	      // returns a reference to the `JSON3` object.
	      "noConflict": function () {
	        if (!isRestored) {
	          isRestored = true;
	          root.JSON = nativeJSON;
	          root["JSON3"] = previousJSON;
	          nativeJSON = previousJSON = null;
	        }
	        return JSON3;
	      }
	    }));

	    root.JSON = {
	      "parse": JSON3.parse,
	      "stringify": JSON3.stringify
	    };
	  }

	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(51)(module), (function() { return this; }())))

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 52 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 53 */
/***/ function(module, exports) {

	// Originally from https://github.com/keen/keen-js/blob/master/src/core/utils/base64.js
	var cc = String.fromCharCode

	/** @const {string} */
	var m = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

	/**
	 * base64 encode a string
	 * @param {string} n
	 * @return {string}
	 */
	function encode (n) {
	  var o = ''
	  var i = 0
	  var i1, i2, i3, e1, e2, e3, e4
	  n = utf8Encode(n)
	  while (i < n.length) {
	    i1 = n.charCodeAt(i++)
	    i2 = n.charCodeAt(i++)
	    i3 = n.charCodeAt(i++)
	    e1 = (i1 >> 2)
	    e2 = (((i1 & 3) << 4) | (i2 >> 4))
	    e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6))
	    e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63
	    o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4)
	  }
	  return o
	}

	/**
	 * @param {string} n
	 * @return {string}
	 */
	function utf8Encode (n) {
	  var o = ''
	  var i = 0
	  var c
	  while (i < n.length) {
	    c = n.charCodeAt(i++)
	    o = o + ((c < 128)
	      ? cc(c)
	      : ((c > 127) && (c < 2048))
	        ? (cc((c >> 6) | 192) + cc((c & 63) | 128))
	        : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128))
	    )
	  }
	  return o
	}

	module.exports = encode


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Treasure Configurator
	 */

	// Modules
	var _ = __webpack_require__(8)
	var invariant = __webpack_require__(3).invariant

	// Helpers
	function validateOptions (options) {
	  // options must be an object
	  invariant(
	    _.isObject(options),
	    'Check out our JavaScript SDK Usage Guide: ' +
	    'http://docs.treasuredata.com/articles/javascript-sdk'
	  )

	  invariant(
	    _.isString(options.writeKey),
	    'Must provide a writeKey'
	  )

	  invariant(
	    _.isString(options.database),
	    'Must provide a database'
	  )

	  invariant(
	    /^[a-z0-9_]{3,255}$/.test(options.database),
	    'Database must be between 3 and 255 characters and must ' +
	    'consist only of lower case letters, numbers, and _'
	  )
	}

	// Default config for library values
	exports.DEFAULT_CONFIG = {
	  development: false,
	  globalIdCookie: '_td_global',
	  host: 'in.treasuredata.com',
	  logging: true,
	  pathname: '/js/v3/event/',
	  protocol: document.location.protocol === 'https:' ? 'https:' : 'http:',
	  requestType: 'jsonp'
	}

	/**
	 * Treasure#configure
	 *
	 * Initial configurator
	 * Checks validity
	 * Creates and sets up client object
	 *
	 * Modify DEFAULT_CONFIG to change any defaults
	 * Protocol defaults to auto-detection but can be set manually
	 * host defaults to in.treasuredata.com
	 * pathname defaults to /js/v3/event/
	 * requestType is always jsonp
	 *
	 */
	exports.configure = function configure (options) {
	  this.client = _.assign({
	    globals: {}
	  }, exports.DEFAULT_CONFIG, options, {
	    requestType: 'jsonp'
	  })

	  validateOptions(this.client)

	  // Add the : if it's missing from the protocol
	  // This is for backwards compatibility
	  if (!/:$/.test(this.client.protocol)) {
	    this.client.protocol += ':'
	  }

	  if (!this.client.endpoint) {
	    this.client.endpoint = this.client.protocol + '//' + this.client.host + this.client.pathname
	  }

	  return this
	}

	/**
	 * Treasure#set
	 *
	 * Table value setter
	 * When you set mutliple attributes, the object is iterated and values are set on the table
	 * Attributes are not recursively set on the table
	 *
	 * Setting a single attribute
	 * Example: td.set('table', 'foo', 'bar')
	 *
	 * Setting multiple properties at once
	 * Example: td.set('table', {foo: 'bar', baz: 'qux'})
	 *
	 * Defaults to setting all attributes in $global
	 * The following are equivalent:
	 * td.set({foo: 'bar'}) == td.set('$global', {foo: 'bar'})
	 *
	 * Attributes in $global get applied to all tables
	 *
	 */
	exports.set = function set (table, property, value) {
	  if (_.isObject(table)) {
	    property = table
	    table = '$global'
	  }

	  this.client.globals[table] = this.client.globals[table] || {}
	  if (_.isObject(property)) {
	    _.assign(this.client.globals[table], property)
	  } else {
	    this.client.globals[table][property] = value
	  }

	  return this
	}

	/**
	 * Treasure#get
	 *
	 * Table value getter
	 *
	 * Getting a single attribute
	 * Example:
	 * td.get('table', 'foo')
	 * // > 'bar'
	 *
	 * Getting all attributes from a table
	 * Example:
	 * td.get('table')
	 * // > {foo: 'bar'}
	 *
	 * Defaults to getting all attributes from $global
	 * The following are equivalent:
	 * td.get() == td.get('$global')
	 * // > {}
	 *
	 * If the table does not exist, its object gets created
	 *
	 */
	exports.get = function get (table, key) {
	  // If no table, show $global
	  table = table || '$global'

	  this.client.globals[table] = this.client.globals[table] || {}
	  return key ? this.client.globals[table][key] : this.client.globals[table]
	}


/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = '1.7.2'


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	  * domready (c) Dustin Diaz 2012 - License MIT
	  */
	!function (name, definition) {
	  if (true) module.exports = definition()
	  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
	  else this[name] = definition()
	}('domready', function (ready) {

	  var fns = [], fn, f = false
	    , doc = document
	    , testEl = doc.documentElement
	    , hack = testEl.doScroll
	    , domContentLoaded = 'DOMContentLoaded'
	    , addEventListener = 'addEventListener'
	    , onreadystatechange = 'onreadystatechange'
	    , readyState = 'readyState'
	    , loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/
	    , loaded = loadedRgx.test(doc[readyState])

	  function flush(f) {
	    loaded = 1
	    while (f = fns.shift()) f()
	  }

	  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
	    doc.removeEventListener(domContentLoaded, fn, f)
	    flush()
	  }, f)


	  hack && doc.attachEvent(onreadystatechange, fn = function () {
	    if (/^c/.test(doc[readyState])) {
	      doc.detachEvent(onreadystatechange, fn)
	      flush()
	    }
	  })

	  return (ready = hack ?
	    function (fn) {
	      self != top ?
	        loaded ? fn() : fns.push(fn) :
	        function () {
	          try {
	            testEl.doScroll('left')
	          } catch (e) {
	            return setTimeout(function() { ready(fn) }, 50)
	          }
	          fn()
	        }()
	    } :
	    function (fn) {
	      loaded ? fn() : fns.push(fn)
	    })
	})


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var window = __webpack_require__(58)
	var elementUtils = __webpack_require__(59)
	var assign = __webpack_require__(8).assign
	var disposable = __webpack_require__(3).disposable

	function defaultExtendClickData (event, data) {
	  return data
	}

	function configure () {
	  this._clickTrackingInstalled = false
	}

	function trackClicks (trackClicksOptions) {
	  if (this._clickTrackingInstalled) return

	  var instance = this
	  var options = assign({
	    element: window.document,
	    extendClickData: defaultExtendClickData,
	    ignoreAttribute: 'td-ignore'
	  }, trackClicksOptions)

	  var treeHasIgnoreAttribute = elementUtils
	    .createTreeHasIgnoreAttribute(options.ignoreAttribute)

	  var removeClickTracker = elementUtils
	    .addEventListener(options.element, 'click', clickTracker)

	  instance._clickTrackingInstalled = true
	  return disposable(function () {
	    removeClickTracker()
	    instance._clickTrackingInstalled = false
	  })

	  function clickTracker (e) {
	    var target = elementUtils.getEventTarget(e)
	    if (
	      !treeHasIgnoreAttribute(target) &&
	      !elementUtils.shouldIgnoreElement(target)
	    ) {
	      var elementData = elementUtils.getElementData(target)
	      var data = options.extendClickData(e, elementData)
	      if (data) {
	        instance.trackEvent('clicks', data)
	      }
	    }
	  }
	}

	module.exports = {
	  configure: configure,
	  trackClicks: trackClicks
	}


/***/ },
/* 58 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
	    module.exports = window;
	} else if (typeof global !== "undefined") {
	    module.exports = global;
	} else if (typeof self !== "undefined"){
	    module.exports = self;
	} else {
	    module.exports = {};
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(8).forEach
	var isString = __webpack_require__(8).isString
	var disposable = __webpack_require__(3).disposable

	// Info: http://www.quirksmode.org/js/events_properties.html
	function getEventTarget (event) {
	  // W3C says it's event.target, but IE8 uses event.srcElement
	  var target = event.target || event.srcElement || window.document

	  // If an event takes place on an element that contains text, this text node,
	  // and not the element, becomes the target of the event
	  return target.nodeType === 3 ? target.parentNode : target
	}

	function addEventListener (el, type, fn) {
	  if (el.addEventListener) {
	    el.addEventListener(type, handler, false)
	    return disposable(function () {
	      el.removeEventListener(type, handler, false)
	    })
	  } else if (el.attachEvent) {
	    el.attachEvent('on' + type, handler)
	    return disposable(function () {
	      el.detachEvent('on' + type, handler)
	    })
	  } else {
	    throw new Error('addEventListener')
	  }

	  // IE8 doesn't pass an event param, grab it from the window if it's missing
	  // Calls the real handler with the correct context, even if we don't use it
	  function handler (event) {
	    fn.call(el, event || window.event)
	  }
	}

	function shouldIgnoreElement (el) {
	  if (!el || !el.tagName) {
	    return true
	  }

	  var tag = el.tagName.toLowerCase()
	  var type = el.getAttribute('type')
	  if (tag === 'input' && type === 'password') {
	    return true
	  }

	  var role = el.getAttribute('role')
	  if (
	    role === 'button' ||
	    role === 'link' ||
	    tag === 'a' ||
	    tag === 'button' ||
	    tag === 'input'
	  ) {
	    return false
	  }

	  return true
	}

	function createTreeHasIgnoreAttribute (ignoreAttribute) {
	  var dataIgnoreAttribute = 'data-' + ignoreAttribute
	  return function treeHasIgnoreAttribute (el) {
	    if (!el || !el.tagName || el.tagName.toLowerCase() === 'html') {
	      return false
	    } else if (
	      el.hasAttribute(ignoreAttribute) ||
	      el.hasAttribute(dataIgnoreAttribute)
	    ) {
	      return true
	    } else {
	      return treeHasIgnoreAttribute(el.parentNode)
	    }
	  }
	}

	function getElementData (el) {
	  var data = {
	    tag: el.tagName.toLowerCase(),
	    tree: htmlTreeAsString(el)
	  }

	  forEach([
	    'alt',
	    'class',
	    'href',
	    'id',
	    'name',
	    'role',
	    'title',
	    'type'
	  ], function (attrName) {
	    if (el.hasAttribute(attrName)) {
	      data[attrName] = el.getAttribute(attrName)
	    }
	  })

	  return data
	}

	/**
	 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
	 * Given a child DOM element, returns a query-selector statement describing that
	 * and its ancestors
	 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
	 * @param elem
	 * @returns {string}
	 */
	function htmlTreeAsString (elem) {
	  var MAX_TRAVERSE_HEIGHT = 5
	  var MAX_OUTPUT_LEN = 80
	  var out = []
	  var height = 0
	  var len = 0
	  var separator = ' > '
	  var sepLength = separator.length
	  var nextStr

	  while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
	    nextStr = htmlElementAsString(elem)
	    // bail out if
	    // - nextStr is the 'html' element
	    // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
	    //   (ignore this limit if we are on the first iteration)
	    if (
	      nextStr === 'html' ||
	      height > 1 &&
	      len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN
	    ) {
	      break
	    }

	    out.push(nextStr)

	    len += nextStr.length
	    elem = elem.parentNode
	  }

	  return out.reverse().join(separator)
	}

	/**
	 * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
	 * Returns a simple, query-selector representation of a DOM element
	 * e.g. [HTMLElement] => input#foo.btn[name=baz]
	 * @param HTMLElement
	 * @returns {string}
	 */
	function htmlElementAsString (elem) {
	  var out = []
	  var className
	  var classes
	  var key
	  var attr
	  var i

	  if (!elem || !elem.tagName) {
	    return ''
	  }

	  out.push(elem.tagName.toLowerCase())
	  if (elem.id) {
	    out.push('#' + elem.id)
	  }

	  className = elem.className
	  if (className && isString(className)) {
	    classes = className.split(' ')
	    for (i = 0; i < classes.length; i++) {
	      out.push('.' + classes[i])
	    }
	  }
	  var attrWhitelist = ['type', 'name', 'title', 'alt']
	  for (i = 0; i < attrWhitelist.length; i++) {
	    key = attrWhitelist[i]
	    attr = elem.getAttribute(key)
	    if (attr) {
	      out.push('[' + key + '="' + attr + '"]')
	    }
	  }
	  return out.join('')
	}

	module.exports = {
	  addEventListener: addEventListener,
	  createTreeHasIgnoreAttribute: createTreeHasIgnoreAttribute,
	  getElementData: getElementData,
	  getEventTarget: getEventTarget,
	  htmlElementAsString: htmlElementAsString,
	  htmlTreeAsString: htmlTreeAsString,
	  shouldIgnoreElement: shouldIgnoreElement
	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Treasure Global ID
	 */

	// Modules
	var jsonp = __webpack_require__(4)
	var invariant = __webpack_require__(3).invariant
	var noop = __webpack_require__(3).noop
	var cookie = __webpack_require__(61).default

	function cacheSuccess (result, cookieName) {
	  cookie.setItem(cookieName, result['global_id'], 6000)
	  return result['global_id']
	}

	function configure () {
	}

	function fetchGlobalID (success, error, forceFetch) {
	  success = success || noop
	  error = error || noop

	  var cookieName = this.client.globalIdCookie
	  var cachedGlobalId = cookie.getItem(this.client.globalIdCookie)
	  if (cachedGlobalId && !forceFetch) {
	    return setTimeout(function () {
	      success(cachedGlobalId)
	    }, 0)
	  }

	  var url = this.client.protocol + '//' + this.client.host + '/js/v3/global_id'

	  invariant(
	    this.client.requestType === 'jsonp',
	    'Request type ' + this.client.requestType + ' not supported'
	  )

	  jsonp(url, {
	    prefix: 'TreasureJSONPCallback',
	    timeout: 10000 // 10 seconds timeout
	  }, function (err, res) {
	    return err ? error(err) : success(cacheSuccess(res, cookieName))
	  })
	}

	module.exports = {
	  cacheSuccess: cacheSuccess,
	  configure: configure,
	  fetchGlobalID: fetchGlobalID
	}


/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var encode = function encode(val) {
	  try {
	    return encodeURIComponent(val);
	  } catch (e) {
	    console.error('error encode %o');
	  }
	  return null;
	};

	var decode = function decode(val) {
	  try {
	    return decodeURIComponent(val);
	  } catch (err) {
	    console.error('error decode %o');
	  }
	  return null;
	};

	var handleSkey = function handleSkey(sKey) {
	  return encode(sKey).replace(/[\-\.\+\*]/g, '\\$&');
	};

	var Cookies = {
	  getItem: function getItem(sKey) {
	    if (!sKey) {
	      return null;
	    }
	    return decode(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + handleSkey(sKey) + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
	  },
	  setItem: function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
	      return false;
	    }
	    var sExpires = '';
	    if (vEnd) {
	      switch (vEnd.constructor) {
	        case Number:
	          if (vEnd === Infinity) {
	            sExpires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
	          } else {
	            sExpires = '; max-age=' + vEnd;
	          }
	          break;
	        case String:
	          sExpires = '; expires=' + vEnd;
	          break;
	        case Date:
	          sExpires = '; expires=' + vEnd.toUTCString();
	          break;
	        default:
	          break;
	      }
	    }
	    document.cookie = [encode(sKey), '=', encode(sValue), sExpires, sDomain ? '; domain=' + sDomain : '', sPath ? '; path=' + sPath : '', bSecure ? '; secure' : ''].join('');
	    return true;
	  },
	  removeItem: function removeItem(sKey, sPath, sDomain) {
	    if (!this.hasItem(sKey)) {
	      return false;
	    }
	    document.cookie = [encode(sKey), '=; expires=Thu, 01 Jan 1970 00:00:00 GMT', sDomain ? '; domain=' + sDomain : '', sPath ? '; path=' + sPath : ''].join('');
	    return true;
	  },
	  hasItem: function hasItem(sKey) {
	    if (!sKey) {
	      return false;
	    }
	    return new RegExp('(?:^|;\\s*)' + encode(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(document.cookie);
	  },
	  keys: function keys() {
	    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
	    aKeys = aKeys.map(function (key) {
	      return decode(key);
	    });
	    return aKeys;
	  }
	};

	exports.default = Cookies;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	* ----------------------
	* Treasure Tracker
	* ----------------------
	*/

	// Modules
	var window = __webpack_require__(58)
	var _ = __webpack_require__(8)
	var cookie = __webpack_require__(61).default
	var generateUUID = __webpack_require__(63)
	var version = __webpack_require__(55)
	var document = window.document
	var tdClientIdSource = 'NONE'
	var tdDocumentCookieOriginal = ''
	var tdClientIdOriginal = ''

	// Helpers
	function configureValues (track) {
	  return _.assign({
	    td_version: function () {
	      return version
	    },
	    td_client_id: function () {
	      return track.uuid
	    },
	    td_charset: function () {
	      return (document.characterSet || document.charset || '-').toLowerCase()
	    },
	    td_language: function () {
	      var nav = window.navigator
	      return (nav && (nav.language || nav.browserLanguage) || '-').toLowerCase()
	    },
	    td_color: function () {
	      return window.screen ? window.screen.colorDepth + '-bit' : '-'
	    },
	    td_screen: function () {
	      return window.screen ? window.screen.width + 'x' + window.screen.height : '-'
	    },
	    td_viewport: function () {
	      var clientHeight = document.documentElement && document.documentElement.clientHeight
	      var clientWidth = document.documentElement && document.documentElement.clientWidth
	      var innerHeight = window.innerHeight
	      var innerWidth = window.innerWidth
	      var height = clientHeight < innerHeight ? innerHeight : clientHeight
	      var width = clientWidth < innerWidth ? innerWidth : clientWidth
	      return width + 'x' + height
	    },
	    td_title: function () {
	      return document.title
	    },
	    td_url: function () {
	      return document.location.href.split('#')[0]
	    },
	    td_user_agent: function () {
	      return window.navigator.userAgent
	    },
	    td_platform: function () {
	      return window.navigator.platform
	    },
	    td_host: function () {
	      return document.location.host
	    },
	    td_path: function () {
	      return document.location.pathname
	    },
	    td_referrer: function () {
	      return document.referrer
	    },
	    td_ip: function () {
	      return 'td_ip'
	    },
	    td_browser: function () {
	      return 'td_browser'
	    },
	    td_browser_version: function () {
	      return 'td_browser_version'
	    },
	    td_os: function () {
	      return 'td_os'
	    },
	    td_os_version: function () {
	      return 'td_os_version'
	    }
	  }, track.values)
	}

	function configureTrack (track) {
	  return _.assign({
	    pageviews: 'pageviews',
	    events: 'events',
	    values: {}
	  }, track)
	}

	function configureStorage (storage) {
	  if (storage === 'none') {
	    return false
	  }

	  storage = _.isObject(storage) ? storage : {}

	  return _.assign({
	    name: '_td',
	    expires: 63072000,
	    domain: document.location.hostname,
	    customDomain: !!storage.domain,
	    path: '/'
	  }, storage)
	}

	function findDomains (domain) {
	  var domainChunks = domain.split('.')
	  var domains = []
	  for (var i = domainChunks.length - 1; i >= 0; i--) {
	    domains.push(domainChunks.slice(i).join('.'))
	  }
	  return domains
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
	  config = _.isObject(config) ? config : {}
	  tdDocumentCookieOriginal = document.cookie

	  // Object configuration for track and storage
	  this.client.track = config.track = configureTrack(config.track)
	  this.client.storage = config.storage = configureStorage(config.storage)

	  // If clientId is not set, check cookies
	  // If it's not set after checking cookies, generate a uuid and assign it
	  if (_.isNumber(config.clientId)) {
	    config.clientId = config.clientId.toString()
	    tdClientIdSource = 'CONFIG'
	  } else if (!config.clientId || !_.isString(config.clientId)) {
	    if (config.storage && config.storage.name) {
	      config.clientId = cookie.getItem(config.storage.name)
	      tdClientIdSource = 'COOKIE'
	    }
	    if (!config.clientId || config.clientId === 'undefined') {
	      config.clientId = generateUUID()
	      tdClientIdSource = 'GENERATED'
	    }
	  }

	  // Remove any NULLs that might be present in the clientId
	  this.client.track.uuid = config.clientId.replace(/\0/g, '')
	  tdClientIdOriginal = this.client.track.uuid

	  // Set cookie on highest allowed domain
	  var setCookie = function (storage, uuid) {
	    var clone = _.assign({}, storage)
	    var is = {
	      ip: storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
	      local: storage.domain === 'localhost',
	      custom: storage.customDomain
	    }

	    // When it's localhost, an IP, or custom domain, set the cookie directly
	    if (is.ip || is.local || is.custom) {
	      clone.domain = is.local ? null : clone.domain
	      cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain)
	    } else {
	      // Otherwise iterate recursively on the domain until it gets set
	      // For example, if we have three sites:
	      // bar.foo.com, baz.foo.com, foo.com
	      // First it tries setting a cookie on .com, and it fails
	      // Then it sets the cookie on foo.com, and it'll pass
	      var domains = findDomains(storage.domain)
	      var ll = domains.length
	      var i = 0
	      // Check cookie to see if it's "undefined".  If it is, remove it
	      if (!uuid) {
	        for (; i < ll; i++) {
	          cookie.removeItem(storage.name, storage.path, domains[i])
	        }
	      } else {
	        for (; i < ll; i++) {
	          clone.domain = domains[i]
	          cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain)

	          // Break when cookies aren't being cleared and it gets set properly
	          // Don't break when uuid is falsy so all the cookies get cleared
	          if (cookie.getItem(storage.name) === uuid) {
	            // When cookie is set succesfully, save used domain in storage object
	            storage.domain = clone.domain
	            break
	          }
	        }
	      }
	    }
	  }

	  // Only save cookies if storage is enabled and expires is non-zero
	  if (config.storage) {
	    if (config.storage.expires) {
	      setCookie(config.storage, undefined)
	      setCookie(config.storage, this.client.track.uuid)
	    }
	  }

	  // Values must be initialized later because they depend on knowing the uuid
	  this.client.track.values = _.assign(configureValues(this.client.track), this.client.track.values)

	  return this
	}

	/**
	 * Track#trackEvent
	 *
	 * Like Treasure#addRecord, except that it'll include all track values
	 *
	 */
	exports.trackEvent = function trackEvent (table, record, success, failure) {
	  // When no table, use default events table
	  if (!table) {
	    table = this.client.track.events
	  }

	  record = _.assign(this.getTrackValues(), record)
	  if (['undefined', undefined, null, 'null', '00000000-0000-4000-8000-000000000000'].indexOf(record.td_client_id) >= 0) {
	    this.addRecord('anomaly', _.assign({}, record, {
	      td_client_id_source: tdClientIdSource,
	      td_document_cookie_original: tdDocumentCookieOriginal,
	      td_document_cookie: document.cookie,
	      td_cookie_value: this.client.storage && cookie.getItem(this.client.storage.name),
	      td_client_id_original: tdClientIdOriginal
	    }))
	  }
	  this.addRecord(table, record, success, failure)
	  return this
	}

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
	    table = this.client.track.pageviews
	  }

	  this.trackEvent(table, {}, success, failure)
	  return this
	}

	/**
	 * Track#getTrackValues
	 *
	 * Returns an object which executes all track value functions
	 *
	 */
	exports.getTrackValues = function getTrackValues () {
	  var result = {}
	  _.forIn(this.client.track.values, function (value, key) {
	    if (value) {
	      result[key] = typeof value === 'function' ? value() : value
	    }
	  })
	  return result
	}


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// Maybe look into a more legit solution later
	// node-uuid doesn't work with old IE's
	// Source: http://stackoverflow.com/a/8809472
	var window = __webpack_require__(58)
	module.exports = function generateUUID () {
	  var d = new Date().getTime()
	  if (window.performance && typeof window.performance.now === 'function') {
	    d += window.performance.now() // use high-precision timer if available
	  }
	  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = (d + Math.random() * 16) % 16 | 0
	    d = Math.floor(d / 16)
	    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
	  })
	  return uuid
	}


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Treasure Client Loader
	 */

	// Modules
	var _ = __webpack_require__(8)
	var window = __webpack_require__(58)

	// Helpers
	function applyToClient (client, method) {
	  var _method = '_' + method
	  if (client[_method]) {
	    var arr = client[_method] || []
	    while (arr.length) {
	      client[method].apply(client, arr.shift())
	    }
	    delete client[_method]
	  }
	}

	// Constants
	var TREASURE_KEYS = [
	  'init',
	  'set',
	  'addRecord',
	  'fetchGlobalID',
	  'trackPageview',
	  'trackEvent',
	  'trackClicks',
	  'ready'
	]

	/**
	 * Load clients
	 */
	module.exports = function loadClients (Treasure, name) {
	  if (_.isObject(window[name])) {
	    var snippet = window[name]
	    var clients = snippet.clients

	    // Copy over Treasure.prototype functions over to snippet's prototype
	    // This allows already-instanciated clients to work
	    _.forIn(Treasure.prototype, function (value, key) {
	      snippet.prototype[key] = value
	    })

	    // Iterate over each client instance
	    _.forEach(clients, function (client) {
	      // Call each key and with any stored values
	      _.forEach(TREASURE_KEYS, function (value) {
	        applyToClient(client, value)
	      })
	    })
	  }
	}


/***/ }
/******/ ]);