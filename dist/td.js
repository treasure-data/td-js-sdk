(function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            "exports": {},
            "id": moduleId,
            "loaded": false
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
})([ function(module, exports, __webpack_require__) {
    var Treasure = __webpack_require__(1);
    var window = __webpack_require__(58);
    __webpack_require__(65)(Treasure, "Treasure");
    window.Treasure = Treasure;
}, function(module, exports, __webpack_require__) {
    var record = __webpack_require__(2);
    var _ = __webpack_require__(8);
    var configurator = __webpack_require__(54);
    var version = __webpack_require__(55);
    function Treasure(options) {
        if (!(this instanceof Treasure)) {
            return new Treasure(options);
        }
        this.init(options);
        return this;
    }
    Treasure.prototype.init = function(options) {
        this.configure(options);
        for (var plugin in Treasure.Plugins) {
            if (Treasure.Plugins.hasOwnProperty(plugin)) {
                Treasure.Plugins[plugin].configure.call(this, options);
            }
        }
    };
    Treasure.version = Treasure.prototype.version = version;
    Treasure.prototype.log = function() {
        var args = [ "[Treasure]" ];
        for (var i = 0, len = arguments.length - 1; i <= len; i++) {
            args.push(arguments[i]);
        }
        if (typeof console !== "undefined" && this.client.logging) {
            console.log.apply(console, args);
        }
    };
    Treasure.prototype.configure = configurator.configure;
    Treasure.prototype.set = configurator.set;
    Treasure.prototype.get = configurator.get;
    Treasure.prototype.ready = __webpack_require__(56);
    Treasure.prototype.applyProperties = record.applyProperties;
    Treasure.prototype.addRecord = record.addRecord;
    Treasure.prototype._sendRecord = record._sendRecord;
    Treasure.prototype._configurator = configurator;
    Treasure.Plugins = {
        "Clicks": __webpack_require__(57),
        "GlobalID": __webpack_require__(60),
        "Personalization": __webpack_require__(62),
        "Track": __webpack_require__(63)
    };
    _.forIn(Treasure.Plugins, function(plugin) {
        _.forIn(plugin, function(method, name) {
            if (!Treasure.prototype[name]) {
                Treasure.prototype[name] = method;
            }
        });
    });
    module.exports = Treasure;
}, function(module, exports, __webpack_require__) {
    var invariant = __webpack_require__(3).invariant;
    var noop = __webpack_require__(3).noop;
    var jsonp = __webpack_require__(4);
    var _ = __webpack_require__(8);
    var objectToBase64 = __webpack_require__(49);
    function validateRecord(table, record) {
        invariant(_.isString(table), "Must provide a table");
        invariant(/^[a-z0-9_]{3,255}$/.test(table), "Table must be between 3 and 255 characters and must " + "consist only of lower case letters, numbers, and _");
        invariant(_.isObject(record), "Must provide a record");
    }
    exports._sendRecord = function _sendRecord(request, success, error) {
        success = success || noop;
        error = error || noop;
        invariant(request.type === "jsonp", "Request type " + request.type + " not supported");
        var params = [ "api_key=" + encodeURIComponent(request.apikey), "modified=" + encodeURIComponent(new Date().getTime()), "data=" + encodeURIComponent(objectToBase64(request.record)) ];
        if (request.time) {
            params.push("time=" + encodeURIComponent(request.time));
        }
        var jsonpUrl = request.url + "?" + params.join("&");
        jsonp(jsonpUrl, {
            "prefix": "TreasureJSONPCallback",
            "timeout": 1e4
        }, function(err, res) {
            return err ? error(err) : success(res);
        });
    };
    exports.applyProperties = function applyProperties(table, payload) {
        return _.assign({}, this.get("$global"), this.get(table), payload);
    };
    exports.addRecord = function addRecord(table, record, success, error) {
        validateRecord(table, record);
        var request = {
            "apikey": this.client.writeKey,
            "record": this.applyProperties(table, record),
            "time": null,
            "type": this.client.requestType,
            "url": this.client.endpoint + this.client.database + "/" + table
        };
        if (request.record.time) {
            request.time = request.record.time;
        }
        if (this.client.development) {
            this.log("addRecord", request);
        } else {
            this._sendRecord(request, success, error);
        }
    };
    exports._validateRecord = validateRecord;
}, function(module, exports) {
    function disposable(action) {
        var disposed = false;
        return function dispose() {
            if (!disposed) {
                disposed = true;
                action();
            }
        };
    }
    function invariant(conditon, text) {
        if (!conditon) {
            throw new Error(text);
        }
    }
    function noop() {}
    module.exports = {
        "disposable": disposable,
        "invariant": invariant,
        "noop": noop
    };
}, function(module, exports, __webpack_require__) {
    var debug = __webpack_require__(5)("jsonp");
    module.exports = jsonp;
    var count = 0;
    function noop() {}
    function jsonp(url, opts, fn) {
        if ("function" == typeof opts) {
            fn = opts;
            opts = {};
        }
        if (!opts) opts = {};
        var prefix = opts.prefix || "__jp";
        var id = opts.name || prefix + count++;
        var param = opts.param || "callback";
        var timeout = null != opts.timeout ? opts.timeout : 6e4;
        var enc = encodeURIComponent;
        var target = document.getElementsByTagName("script")[0] || document.head;
        var script;
        var timer;
        if (timeout) {
            timer = setTimeout(function() {
                cleanup();
                if (fn) fn(new Error("Timeout"));
            }, timeout);
        }
        function cleanup() {
            if (script.parentNode) script.parentNode.removeChild(script);
            window[id] = noop;
            if (timer) clearTimeout(timer);
        }
        function cancel() {
            if (window[id]) {
                cleanup();
            }
        }
        window[id] = function(data) {
            debug("jsonp got", data);
            cleanup();
            if (fn) fn(null, data);
        };
        url += (~url.indexOf("?") ? "&" : "?") + param + "=" + enc(id);
        url = url.replace("?&", "?");
        debug('jsonp req "%s"', url);
        script = document.createElement("script");
        script.src = url;
        target.parentNode.insertBefore(script, target);
        return cancel;
    }
}, function(module, exports, __webpack_require__) {
    exports = module.exports = __webpack_require__(6);
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    var storage;
    if (typeof chrome !== "undefined" && typeof chrome.storage !== "undefined") storage = chrome.storage.local; else storage = localstorage();
    exports.colors = [ "lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson" ];
    function useColors() {
        return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31;
    }
    exports.formatters.j = function(v) {
        return JSON.stringify(v);
    };
    function formatArgs() {
        var args = arguments;
        var useColors = this.useColors;
        args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff);
        if (!useColors) return args;
        var c = "color: " + this.color;
        args = [ args[0], c, "color: inherit" ].concat(Array.prototype.slice.call(args, 1));
        var index = 0;
        var lastC = 0;
        args[0].replace(/%[a-z%]/g, function(match) {
            if ("%%" === match) return;
            index++;
            if ("%c" === match) {
                lastC = index;
            }
        });
        args.splice(lastC, 0, c);
        return args;
    }
    function log() {
        return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
        try {
            if (null == namespaces) {
                storage.removeItem("debug");
            } else {
                storage.debug = namespaces;
            }
        } catch (e) {}
    }
    function load() {
        var r;
        try {
            r = storage.debug;
        } catch (e) {}
        return r;
    }
    exports.enable(load());
    function localstorage() {
        try {
            return window.localStorage;
        } catch (e) {}
    }
}, function(module, exports, __webpack_require__) {
    exports = module.exports = debug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = __webpack_require__(7);
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevColor = 0;
    var prevTime;
    function selectColor() {
        return exports.colors[prevColor++ % exports.colors.length];
    }
    function debug(namespace) {
        function disabled() {}
        disabled.enabled = false;
        function enabled() {
            var self = enabled;
            var curr = +new Date();
            var ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            if (null == self.useColors) self.useColors = exports.useColors();
            if (null == self.color && self.useColors) self.color = selectColor();
            var args = Array.prototype.slice.call(arguments);
            args[0] = exports.coerce(args[0]);
            if ("string" !== typeof args[0]) {
                args = [ "%o" ].concat(args);
            }
            var index = 0;
            args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
                if (match === "%%") return match;
                index++;
                var formatter = exports.formatters[format];
                if ("function" === typeof formatter) {
                    var val = args[index];
                    match = formatter.call(self, val);
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            if ("function" === typeof exports.formatArgs) {
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
    function enable(namespaces) {
        exports.save(namespaces);
        var split = (namespaces || "").split(/[\s,]+/);
        var len = split.length;
        for (var i = 0; i < len; i++) {
            if (!split[i]) continue;
            namespaces = split[i].replace(/\*/g, ".*?");
            if (namespaces[0] === "-") {
                exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
            } else {
                exports.names.push(new RegExp("^" + namespaces + "$"));
            }
        }
    }
    function disable() {
        exports.enable("");
    }
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
    function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
    }
}, function(module, exports) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module.exports = function(val, options) {
        options = options || {};
        if ("string" == typeof val) return parse(val);
        return options.long ? long(val) : short(val);
    };
    function parse(str) {
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
        if (!match) return;
        var n = parseFloat(match[1]);
        var type = (match[2] || "ms").toLowerCase();
        switch (type) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return n * y;

          case "days":
          case "day":
          case "d":
            return n * d;

          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return n * h;

          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return n * m;

          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return n * s;

          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return n;
        }
    }
    function short(ms) {
        if (ms >= d) return Math.round(ms / d) + "d";
        if (ms >= h) return Math.round(ms / h) + "h";
        if (ms >= m) return Math.round(ms / m) + "m";
        if (ms >= s) return Math.round(ms / s) + "s";
        return ms + "ms";
    }
    function long(ms) {
        return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
        if (ms < n) return;
        if (ms < n * 1.5) return Math.floor(ms / n) + " " + name;
        return Math.ceil(ms / n) + " " + name + "s";
    }
}, function(module, exports, __webpack_require__) {
    module.exports = {
        "forEach": __webpack_require__(9),
        "isNumber": __webpack_require__(38),
        "isObject": __webpack_require__(16),
        "isString": __webpack_require__(17),
        "assign": __webpack_require__(39),
        "forIn": __webpack_require__(46),
        "noop": __webpack_require__(48)
    };
}, function(module, exports, __webpack_require__) {
    var arrayEach = __webpack_require__(10), baseEach = __webpack_require__(11), createForEach = __webpack_require__(35);
    var forEach = createForEach(arrayEach, baseEach);
    module.exports = forEach;
}, function(module, exports) {
    function arrayEach(array, iteratee) {
        var index = -1, length = array.length;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    module.exports = arrayEach;
}, function(module, exports, __webpack_require__) {
    var baseForOwn = __webpack_require__(12), createBaseEach = __webpack_require__(34);
    var baseEach = createBaseEach(baseForOwn);
    module.exports = baseEach;
}, function(module, exports, __webpack_require__) {
    var baseFor = __webpack_require__(13), keys = __webpack_require__(20);
    function baseForOwn(object, iteratee) {
        return baseFor(object, iteratee, keys);
    }
    module.exports = baseForOwn;
}, function(module, exports, __webpack_require__) {
    var createBaseFor = __webpack_require__(14);
    var baseFor = createBaseFor();
    module.exports = baseFor;
}, function(module, exports, __webpack_require__) {
    var toObject = __webpack_require__(15);
    function createBaseFor(fromRight) {
        return function(object, iteratee, keysFunc) {
            var iterable = toObject(object), props = keysFunc(object), length = props.length, index = fromRight ? length : -1;
            while (fromRight ? index-- : ++index < length) {
                var key = props[index];
                if (iteratee(iterable[key], key, iterable) === false) {
                    break;
                }
            }
            return object;
        };
    }
    module.exports = createBaseFor;
}, function(module, exports, __webpack_require__) {
    var isObject = __webpack_require__(16), isString = __webpack_require__(17), support = __webpack_require__(19);
    function toObject(value) {
        if (support.unindexedChars && isString(value)) {
            var index = -1, length = value.length, result = Object(value);
            while (++index < length) {
                result[index] = value.charAt(index);
            }
            return result;
        }
        return isObject(value) ? value : Object(value);
    }
    module.exports = toObject;
}, function(module, exports) {
    function isObject(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
    }
    module.exports = isObject;
}, function(module, exports, __webpack_require__) {
    var isObjectLike = __webpack_require__(18);
    var stringTag = "[object String]";
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isString(value) {
        return typeof value == "string" || isObjectLike(value) && objToString.call(value) == stringTag;
    }
    module.exports = isString;
}, function(module, exports) {
    function isObjectLike(value) {
        return !!value && typeof value == "object";
    }
    module.exports = isObjectLike;
}, function(module, exports) {
    var arrayProto = Array.prototype, errorProto = Error.prototype, objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice;
    var support = {};
    (function(x) {
        var Ctor = function() {
            this.x = x;
        }, object = {
            "0": x,
            "length": x
        }, props = [];
        Ctor.prototype = {
            "valueOf": x,
            "y": x
        };
        for (var key in new Ctor()) {
            props.push(key);
        }
        support.enumErrorProps = propertyIsEnumerable.call(errorProto, "message") || propertyIsEnumerable.call(errorProto, "name");
        support.enumPrototypes = propertyIsEnumerable.call(Ctor, "prototype");
        support.nonEnumShadows = !/valueOf/.test(props);
        support.ownLast = props[0] != "x";
        support.spliceObjects = (splice.call(object, 0, 1), !object[0]);
        support.unindexedChars = "x"[0] + Object("x")[0] != "xx";
    })(1, 0);
    module.exports = support;
}, function(module, exports, __webpack_require__) {
    var getNative = __webpack_require__(21), isArrayLike = __webpack_require__(25), isObject = __webpack_require__(16), shimKeys = __webpack_require__(29), support = __webpack_require__(19);
    var nativeKeys = getNative(Object, "keys");
    var keys = !nativeKeys ? shimKeys : function(object) {
        var Ctor = object == null ? undefined : object.constructor;
        if (typeof Ctor == "function" && Ctor.prototype === object || (typeof object == "function" ? support.enumPrototypes : isArrayLike(object))) {
            return shimKeys(object);
        }
        return isObject(object) ? nativeKeys(object) : [];
    };
    module.exports = keys;
}, function(module, exports, __webpack_require__) {
    var isNative = __webpack_require__(22);
    function getNative(object, key) {
        var value = object == null ? undefined : object[key];
        return isNative(value) ? value : undefined;
    }
    module.exports = getNative;
}, function(module, exports, __webpack_require__) {
    var isFunction = __webpack_require__(23), isHostObject = __webpack_require__(24), isObjectLike = __webpack_require__(18);
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var objectProto = Object.prototype;
    var fnToString = Function.prototype.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
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
}, function(module, exports, __webpack_require__) {
    var isObject = __webpack_require__(16);
    var funcTag = "[object Function]";
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isFunction(value) {
        return isObject(value) && objToString.call(value) == funcTag;
    }
    module.exports = isFunction;
}, function(module, exports) {
    var isHostObject = function() {
        try {
            Object({
                "toString": 0
            } + "");
        } catch (e) {
            return function() {
                return false;
            };
        }
        return function(value) {
            return typeof value.toString != "function" && typeof (value + "") == "string";
        };
    }();
    module.exports = isHostObject;
}, function(module, exports, __webpack_require__) {
    var getLength = __webpack_require__(26), isLength = __webpack_require__(28);
    function isArrayLike(value) {
        return value != null && isLength(getLength(value));
    }
    module.exports = isArrayLike;
}, function(module, exports, __webpack_require__) {
    var baseProperty = __webpack_require__(27);
    var getLength = baseProperty("length");
    module.exports = getLength;
}, function(module, exports, __webpack_require__) {
    var toObject = __webpack_require__(15);
    function baseProperty(key) {
        return function(object) {
            return object == null ? undefined : toObject(object)[key];
        };
    }
    module.exports = baseProperty;
}, function(module, exports) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    module.exports = isLength;
}, function(module, exports, __webpack_require__) {
    var isArguments = __webpack_require__(30), isArray = __webpack_require__(31), isIndex = __webpack_require__(32), isLength = __webpack_require__(28), isString = __webpack_require__(17), keysIn = __webpack_require__(33);
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function shimKeys(object) {
        var props = keysIn(object), propsLength = props.length, length = propsLength && object.length;
        var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object) || isString(object));
        var index = -1, result = [];
        while (++index < propsLength) {
            var key = props[index];
            if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
                result.push(key);
            }
        }
        return result;
    }
    module.exports = shimKeys;
}, function(module, exports, __webpack_require__) {
    var isArrayLike = __webpack_require__(25), isObjectLike = __webpack_require__(18);
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    function isArguments(value) {
        return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    }
    module.exports = isArguments;
}, function(module, exports, __webpack_require__) {
    var getNative = __webpack_require__(21), isLength = __webpack_require__(28), isObjectLike = __webpack_require__(18);
    var arrayTag = "[object Array]";
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    var nativeIsArray = getNative(Array, "isArray");
    var isArray = nativeIsArray || function(value) {
        return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
    };
    module.exports = isArray;
}, function(module, exports) {
    var reIsUint = /^\d+$/;
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isIndex(value, length) {
        value = typeof value == "number" || reIsUint.test(value) ? +value : -1;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return value > -1 && value % 1 == 0 && value < length;
    }
    module.exports = isIndex;
}, function(module, exports, __webpack_require__) {
    var arrayEach = __webpack_require__(10), isArguments = __webpack_require__(30), isArray = __webpack_require__(31), isFunction = __webpack_require__(23), isIndex = __webpack_require__(32), isLength = __webpack_require__(28), isObject = __webpack_require__(16), isString = __webpack_require__(17), support = __webpack_require__(19);
    var arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", stringTag = "[object String]";
    var shadowProps = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];
    var errorProto = Error.prototype, objectProto = Object.prototype, stringProto = String.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objToString = objectProto.toString;
    var nonEnumProps = {};
    nonEnumProps[arrayTag] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = {
        "constructor": true,
        "toLocaleString": true,
        "toString": true,
        "valueOf": true
    };
    nonEnumProps[boolTag] = nonEnumProps[stringTag] = {
        "constructor": true,
        "toString": true,
        "valueOf": true
    };
    nonEnumProps[errorTag] = nonEnumProps[funcTag] = nonEnumProps[regexpTag] = {
        "constructor": true,
        "toString": true
    };
    nonEnumProps[objectTag] = {
        "constructor": true
    };
    arrayEach(shadowProps, function(key) {
        for (var tag in nonEnumProps) {
            if (hasOwnProperty.call(nonEnumProps, tag)) {
                var props = nonEnumProps[tag];
                props[key] = hasOwnProperty.call(props, key);
            }
        }
    });
    function keysIn(object) {
        if (object == null) {
            return [];
        }
        if (!isObject(object)) {
            object = Object(object);
        }
        var length = object.length;
        length = length && isLength(length) && (isArray(object) || isArguments(object) || isString(object)) && length || 0;
        var Ctor = object.constructor, index = -1, proto = isFunction(Ctor) && Ctor.prototype || objectProto, isProto = proto === object, result = Array(length), skipIndexes = length > 0, skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error), skipProto = support.enumPrototypes && isFunction(object);
        while (++index < length) {
            result[index] = index + "";
        }
        for (var key in object) {
            if (!(skipProto && key == "prototype") && !(skipErrorProps && (key == "message" || key == "name")) && !(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
                result.push(key);
            }
        }
        if (support.nonEnumShadows && object !== objectProto) {
            var tag = object === stringProto ? stringTag : object === errorProto ? errorTag : objToString.call(object), nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];
            if (tag == objectTag) {
                proto = objectProto;
            }
            length = shadowProps.length;
            while (length--) {
                key = shadowProps[length];
                var nonEnum = nonEnums[key];
                if (!(isProto && nonEnum) && (nonEnum ? hasOwnProperty.call(object, key) : object[key] !== proto[key])) {
                    result.push(key);
                }
            }
        }
        return result;
    }
    module.exports = keysIn;
}, function(module, exports, __webpack_require__) {
    var getLength = __webpack_require__(26), isLength = __webpack_require__(28), toObject = __webpack_require__(15);
    function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
            var length = collection ? getLength(collection) : 0;
            if (!isLength(length)) {
                return eachFunc(collection, iteratee);
            }
            var index = fromRight ? length : -1, iterable = toObject(collection);
            while (fromRight ? index-- : ++index < length) {
                if (iteratee(iterable[index], index, iterable) === false) {
                    break;
                }
            }
            return collection;
        };
    }
    module.exports = createBaseEach;
}, function(module, exports, __webpack_require__) {
    var bindCallback = __webpack_require__(36), isArray = __webpack_require__(31);
    function createForEach(arrayFunc, eachFunc) {
        return function(collection, iteratee, thisArg) {
            return typeof iteratee == "function" && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee) : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
        };
    }
    module.exports = createForEach;
}, function(module, exports, __webpack_require__) {
    var identity = __webpack_require__(37);
    function bindCallback(func, thisArg, argCount) {
        if (typeof func != "function") {
            return identity;
        }
        if (thisArg === undefined) {
            return func;
        }
        switch (argCount) {
          case 1:
            return function(value) {
                return func.call(thisArg, value);
            };

          case 3:
            return function(value, index, collection) {
                return func.call(thisArg, value, index, collection);
            };

          case 4:
            return function(accumulator, value, index, collection) {
                return func.call(thisArg, accumulator, value, index, collection);
            };

          case 5:
            return function(value, other, key, object, source) {
                return func.call(thisArg, value, other, key, object, source);
            };
        }
        return function() {
            return func.apply(thisArg, arguments);
        };
    }
    module.exports = bindCallback;
}, function(module, exports) {
    function identity(value) {
        return value;
    }
    module.exports = identity;
}, function(module, exports, __webpack_require__) {
    var isObjectLike = __webpack_require__(18);
    var numberTag = "[object Number]";
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && objToString.call(value) == numberTag;
    }
    module.exports = isNumber;
}, function(module, exports, __webpack_require__) {
    var assignWith = __webpack_require__(40), baseAssign = __webpack_require__(41), createAssigner = __webpack_require__(43);
    var assign = createAssigner(function(object, source, customizer) {
        return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
    });
    module.exports = assign;
}, function(module, exports, __webpack_require__) {
    var keys = __webpack_require__(20);
    function assignWith(object, source, customizer) {
        var index = -1, props = keys(source), length = props.length;
        while (++index < length) {
            var key = props[index], value = object[key], result = customizer(value, source[key], key, object, source);
            if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
                object[key] = result;
            }
        }
        return object;
    }
    module.exports = assignWith;
}, function(module, exports, __webpack_require__) {
    var baseCopy = __webpack_require__(42), keys = __webpack_require__(20);
    function baseAssign(object, source) {
        return source == null ? object : baseCopy(source, keys(source), object);
    }
    module.exports = baseAssign;
}, function(module, exports) {
    function baseCopy(source, props, object) {
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
            var key = props[index];
            object[key] = source[key];
        }
        return object;
    }
    module.exports = baseCopy;
}, function(module, exports, __webpack_require__) {
    var bindCallback = __webpack_require__(36), isIterateeCall = __webpack_require__(44), restParam = __webpack_require__(45);
    function createAssigner(assigner) {
        return restParam(function(object, sources) {
            var index = -1, length = object == null ? 0 : sources.length, customizer = length > 2 ? sources[length - 2] : undefined, guard = length > 2 ? sources[2] : undefined, thisArg = length > 1 ? sources[length - 1] : undefined;
            if (typeof customizer == "function") {
                customizer = bindCallback(customizer, thisArg, 5);
                length -= 2;
            } else {
                customizer = typeof thisArg == "function" ? thisArg : undefined;
                length -= customizer ? 1 : 0;
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
}, function(module, exports, __webpack_require__) {
    var isArrayLike = __webpack_require__(25), isIndex = __webpack_require__(32), isObject = __webpack_require__(16);
    function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
            return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
            var other = object[index];
            return value === value ? value === other : other !== other;
        }
        return false;
    }
    module.exports = isIterateeCall;
}, function(module, exports) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var nativeMax = Math.max;
    function restParam(func, start) {
        if (typeof func != "function") {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0);
        return function() {
            var args = arguments, index = -1, length = nativeMax(args.length - start, 0), rest = Array(length);
            while (++index < length) {
                rest[index] = args[start + index];
            }
            switch (start) {
              case 0:
                return func.call(this, rest);

              case 1:
                return func.call(this, args[0], rest);

              case 2:
                return func.call(this, args[0], args[1], rest);
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
}, function(module, exports, __webpack_require__) {
    var baseFor = __webpack_require__(13), createForIn = __webpack_require__(47);
    var forIn = createForIn(baseFor);
    module.exports = forIn;
}, function(module, exports, __webpack_require__) {
    var bindCallback = __webpack_require__(36), keysIn = __webpack_require__(33);
    function createForIn(objectFunc) {
        return function(object, iteratee, thisArg) {
            if (typeof iteratee != "function" || thisArg !== undefined) {
                iteratee = bindCallback(iteratee, thisArg, 3);
            }
            return objectFunc(object, iteratee, keysIn);
        };
    }
    module.exports = createForIn;
}, function(module, exports) {
    function noop() {}
    module.exports = noop;
}, function(module, exports, __webpack_require__) {
    var JSON3 = __webpack_require__(50);
    var toBase64 = __webpack_require__(53);
    module.exports = function objectToBase64(object) {
        return toBase64(JSON3.stringify(object));
    };
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function(module, global) {
        (function() {
            var isLoader = "function" === "function" && __webpack_require__(52);
            var objectTypes = {
                "function": true,
                "object": true
            };
            var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
            var root = objectTypes[typeof window] && window || this, freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;
            if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
                root = freeGlobal;
            }
            function runInContext(context, exports) {
                context || (context = root["Object"]());
                exports || (exports = root["Object"]());
                var Number = context["Number"] || root["Number"], String = context["String"] || root["String"], Object = context["Object"] || root["Object"], Date = context["Date"] || root["Date"], SyntaxError = context["SyntaxError"] || root["SyntaxError"], TypeError = context["TypeError"] || root["TypeError"], Math = context["Math"] || root["Math"], nativeJSON = context["JSON"] || root["JSON"];
                if (typeof nativeJSON == "object" && nativeJSON) {
                    exports.stringify = nativeJSON.stringify;
                    exports.parse = nativeJSON.parse;
                }
                var objectProto = Object.prototype, getClass = objectProto.toString, isProperty, forEach, undef;
                var isExtended = new Date(-0xc782b5b800cec);
                try {
                    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 && isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
                } catch (exception) {}
                function has(name) {
                    if (has[name] !== undef) {
                        return has[name];
                    }
                    var isSupported;
                    if (name == "bug-string-char-index") {
                        isSupported = "a"[0] != "a";
                    } else if (name == "json") {
                        isSupported = has("json-stringify") && has("json-parse");
                    } else {
                        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                        if (name == "json-stringify") {
                            var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
                            if (stringifySupported) {
                                (value = function() {
                                    return 1;
                                }).toJSON = value;
                                try {
                                    stringifySupported = stringify(0) === "0" && stringify(new Number()) === "0" && stringify(new String()) == '""' && stringify(getClass) === undef && stringify(undef) === undef && stringify() === undef && stringify(value) === "1" && stringify([ value ]) == "[1]" && stringify([ undef ]) == "[null]" && stringify(null) == "null" && stringify([ undef, getClass, null ]) == "[null,null,null]" && stringify({
                                        "a": [ value, true, false, null, "\0\b\n\f\r\t" ]
                                    }) == serialized && stringify(null, value) === "1" && stringify([ 1, 2 ], null, 1) == "[\n 1,\n 2\n]" && stringify(new Date(-864e13)) == '"-271821-04-20T00:00:00.000Z"' && stringify(new Date(864e13)) == '"+275760-09-13T00:00:00.000Z"' && stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' && stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
                                } catch (exception) {
                                    stringifySupported = false;
                                }
                            }
                            isSupported = stringifySupported;
                        }
                        if (name == "json-parse") {
                            var parse = exports.parse;
                            if (typeof parse == "function") {
                                try {
                                    if (parse("0") === 0 && !parse(false)) {
                                        value = parse(serialized);
                                        var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                                        if (parseSupported) {
                                            try {
                                                parseSupported = !parse('"\t"');
                                            } catch (exception) {}
                                            if (parseSupported) {
                                                try {
                                                    parseSupported = parse("01") !== 1;
                                                } catch (exception) {}
                                            }
                                            if (parseSupported) {
                                                try {
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
                    var functionClass = "[object Function]", dateClass = "[object Date]", numberClass = "[object Number]", stringClass = "[object String]", arrayClass = "[object Array]", booleanClass = "[object Boolean]";
                    var charIndexBuggy = has("bug-string-char-index");
                    if (!isExtended) {
                        var floor = Math.floor;
                        var Months = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];
                        var getDay = function(year, month) {
                            return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
                        };
                    }
                    if (!(isProperty = objectProto.hasOwnProperty)) {
                        isProperty = function(property) {
                            var members = {}, constructor;
                            if ((members.__proto__ = null, members.__proto__ = {
                                "toString": 1
                            }, members).toString != getClass) {
                                isProperty = function(property) {
                                    var original = this.__proto__, result = property in (this.__proto__ = null, this);
                                    this.__proto__ = original;
                                    return result;
                                };
                            } else {
                                constructor = members.constructor;
                                isProperty = function(property) {
                                    var parent = (this.constructor || constructor).prototype;
                                    return property in this && !(property in parent && this[property] === parent[property]);
                                };
                            }
                            members = null;
                            return isProperty.call(this, property);
                        };
                    }
                    forEach = function(object, callback) {
                        var size = 0, Properties, members, property;
                        (Properties = function() {
                            this.valueOf = 0;
                        }).prototype.valueOf = 0;
                        members = new Properties();
                        for (property in members) {
                            if (isProperty.call(members, property)) {
                                size++;
                            }
                        }
                        Properties = members = null;
                        if (!size) {
                            members = [ "valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor" ];
                            forEach = function(object, callback) {
                                var isFunction = getClass.call(object) == functionClass, property, length;
                                var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
                                for (property in object) {
                                    if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                                        callback(property);
                                    }
                                }
                                for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property)) ;
                            };
                        } else if (size == 2) {
                            forEach = function(object, callback) {
                                var members = {}, isFunction = getClass.call(object) == functionClass, property;
                                for (property in object) {
                                    if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                                        callback(property);
                                    }
                                }
                            };
                        } else {
                            forEach = function(object, callback) {
                                var isFunction = getClass.call(object) == functionClass, property, isConstructor;
                                for (property in object) {
                                    if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                                        callback(property);
                                    }
                                }
                                if (isConstructor || isProperty.call(object, property = "constructor")) {
                                    callback(property);
                                }
                            };
                        }
                        return forEach(object, callback);
                    };
                    if (!has("json-stringify")) {
                        var Escapes = {
                            "92": "\\\\",
                            "34": '\\"',
                            "8": "\\b",
                            "12": "\\f",
                            "10": "\\n",
                            "13": "\\r",
                            "9": "\\t"
                        };
                        var leadingZeroes = "000000";
                        var toPaddedString = function(width, value) {
                            return (leadingZeroes + (value || 0)).slice(-width);
                        };
                        var unicodePrefix = "\\u00";
                        var quote = function(value) {
                            var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
                            var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
                            for (;index < length; index++) {
                                var charCode = value.charCodeAt(index);
                                switch (charCode) {
                                  case 8:
                                  case 9:
                                  case 10:
                                  case 12:
                                  case 13:
                                  case 34:
                                  case 92:
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
                        var serialize = function(property, object, callback, properties, whitespace, indentation, stack) {
                            var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
                            try {
                                value = object[property];
                            } catch (exception) {}
                            if (typeof value == "object" && value) {
                                className = getClass.call(value);
                                if (className == dateClass && !isProperty.call(value, "toJSON")) {
                                    if (value > -1 / 0 && value < 1 / 0) {
                                        if (getDay) {
                                            date = floor(value / 864e5);
                                            for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++) ;
                                            for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++) ;
                                            date = 1 + date - getDay(year, month);
                                            time = (value % 864e5 + 864e5) % 864e5;
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
                                        value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) + "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) + "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) + "." + toPaddedString(3, milliseconds) + "Z";
                                    } else {
                                        value = null;
                                    }
                                } else if (typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || isProperty.call(value, "toJSON"))) {
                                    value = value.toJSON(property);
                                }
                            }
                            if (callback) {
                                value = callback.call(object, property, value);
                            }
                            if (value === null) {
                                return "null";
                            }
                            className = getClass.call(value);
                            if (className == booleanClass) {
                                return "" + value;
                            } else if (className == numberClass) {
                                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
                            } else if (className == stringClass) {
                                return quote("" + value);
                            }
                            if (typeof value == "object") {
                                for (length = stack.length; length--; ) {
                                    if (stack[length] === value) {
                                        throw TypeError();
                                    }
                                }
                                stack.push(value);
                                results = [];
                                prefix = indentation;
                                indentation += whitespace;
                                if (className == arrayClass) {
                                    for (index = 0, length = value.length; index < length; index++) {
                                        element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                                        results.push(element === undef ? "null" : element);
                                    }
                                    result = results.length ? whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : "[" + results.join(",") + "]" : "[]";
                                } else {
                                    forEach(properties || value, function(property) {
                                        var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                                        if (element !== undef) {
                                            results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                                        }
                                    });
                                    result = results.length ? whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : "{" + results.join(",") + "}" : "{}";
                                }
                                stack.pop();
                                return result;
                            }
                        };
                        exports.stringify = function(source, filter, width) {
                            var whitespace, callback, properties, className;
                            if (objectTypes[typeof filter] && filter) {
                                if ((className = getClass.call(filter)) == functionClass) {
                                    callback = filter;
                                } else if (className == arrayClass) {
                                    properties = {};
                                    for (var index = 0, length = filter.length, value; index < length; value = filter[index++], 
                                    (className = getClass.call(value), className == stringClass || className == numberClass) && (properties[value] = 1)) ;
                                }
                            }
                            if (width) {
                                if ((className = getClass.call(width)) == numberClass) {
                                    if ((width -= width % 1) > 0) {
                                        for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ") ;
                                    }
                                } else if (className == stringClass) {
                                    whitespace = width.length <= 10 ? width : width.slice(0, 10);
                                }
                            }
                            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
                        };
                    }
                    if (!has("json-parse")) {
                        var fromCharCode = String.fromCharCode;
                        var Unescapes = {
                            "92": "\\",
                            "34": '"',
                            "47": "/",
                            "98": "\b",
                            "116": "\t",
                            "110": "\n",
                            "102": "\f",
                            "114": "\r"
                        };
                        var Index, Source;
                        var abort = function() {
                            Index = Source = null;
                            throw SyntaxError();
                        };
                        var lex = function() {
                            var source = Source, length = source.length, value, begin, position, isSigned, charCode;
                            while (Index < length) {
                                charCode = source.charCodeAt(Index);
                                switch (charCode) {
                                  case 9:
                                  case 10:
                                  case 13:
                                  case 32:
                                    Index++;
                                    break;

                                  case 123:
                                  case 125:
                                  case 91:
                                  case 93:
                                  case 58:
                                  case 44:
                                    value = charIndexBuggy ? source.charAt(Index) : source[Index];
                                    Index++;
                                    return value;

                                  case 34:
                                    for (value = "@", Index++; Index < length; ) {
                                        charCode = source.charCodeAt(Index);
                                        if (charCode < 32) {
                                            abort();
                                        } else if (charCode == 92) {
                                            charCode = source.charCodeAt(++Index);
                                            switch (charCode) {
                                              case 92:
                                              case 34:
                                              case 47:
                                              case 98:
                                              case 116:
                                              case 110:
                                              case 102:
                                              case 114:
                                                value += Unescapes[charCode];
                                                Index++;
                                                break;

                                              case 117:
                                                begin = ++Index;
                                                for (position = Index + 4; Index < position; Index++) {
                                                    charCode = source.charCodeAt(Index);
                                                    if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                                                        abort();
                                                    }
                                                }
                                                value += fromCharCode("0x" + source.slice(begin, Index));
                                                break;

                                              default:
                                                abort();
                                            }
                                        } else {
                                            if (charCode == 34) {
                                                break;
                                            }
                                            charCode = source.charCodeAt(Index);
                                            begin = Index;
                                            while (charCode >= 32 && charCode != 92 && charCode != 34) {
                                                charCode = source.charCodeAt(++Index);
                                            }
                                            value += source.slice(begin, Index);
                                        }
                                    }
                                    if (source.charCodeAt(Index) == 34) {
                                        Index++;
                                        return value;
                                    }
                                    abort();

                                  default:
                                    begin = Index;
                                    if (charCode == 45) {
                                        isSigned = true;
                                        charCode = source.charCodeAt(++Index);
                                    }
                                    if (charCode >= 48 && charCode <= 57) {
                                        if (charCode == 48 && (charCode = source.charCodeAt(Index + 1), charCode >= 48 && charCode <= 57)) {
                                            abort();
                                        }
                                        isSigned = false;
                                        for (;Index < length && (charCode = source.charCodeAt(Index), charCode >= 48 && charCode <= 57); Index++) ;
                                        if (source.charCodeAt(Index) == 46) {
                                            position = ++Index;
                                            for (;position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++) ;
                                            if (position == Index) {
                                                abort();
                                            }
                                            Index = position;
                                        }
                                        charCode = source.charCodeAt(Index);
                                        if (charCode == 101 || charCode == 69) {
                                            charCode = source.charCodeAt(++Index);
                                            if (charCode == 43 || charCode == 45) {
                                                Index++;
                                            }
                                            for (position = Index; position < length && (charCode = source.charCodeAt(position), 
                                            charCode >= 48 && charCode <= 57); position++) ;
                                            if (position == Index) {
                                                abort();
                                            }
                                            Index = position;
                                        }
                                        return +source.slice(begin, Index);
                                    }
                                    if (isSigned) {
                                        abort();
                                    }
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
                                    abort();
                                }
                            }
                            return "$";
                        };
                        var get = function(value) {
                            var results, hasMembers;
                            if (value == "$") {
                                abort();
                            }
                            if (typeof value == "string") {
                                if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                                    return value.slice(1);
                                }
                                if (value == "[") {
                                    results = [];
                                    for (;;hasMembers || (hasMembers = true)) {
                                        value = lex();
                                        if (value == "]") {
                                            break;
                                        }
                                        if (hasMembers) {
                                            if (value == ",") {
                                                value = lex();
                                                if (value == "]") {
                                                    abort();
                                                }
                                            } else {
                                                abort();
                                            }
                                        }
                                        if (value == ",") {
                                            abort();
                                        }
                                        results.push(get(value));
                                    }
                                    return results;
                                } else if (value == "{") {
                                    results = {};
                                    for (;;hasMembers || (hasMembers = true)) {
                                        value = lex();
                                        if (value == "}") {
                                            break;
                                        }
                                        if (hasMembers) {
                                            if (value == ",") {
                                                value = lex();
                                                if (value == "}") {
                                                    abort();
                                                }
                                            } else {
                                                abort();
                                            }
                                        }
                                        if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                                            abort();
                                        }
                                        results[value.slice(1)] = get(lex());
                                    }
                                    return results;
                                }
                                abort();
                            }
                            return value;
                        };
                        var update = function(source, property, callback) {
                            var element = walk(source, property, callback);
                            if (element === undef) {
                                delete source[property];
                            } else {
                                source[property] = element;
                            }
                        };
                        var walk = function(source, property, callback) {
                            var value = source[property], length;
                            if (typeof value == "object" && value) {
                                if (getClass.call(value) == arrayClass) {
                                    for (length = value.length; length--; ) {
                                        update(value, length, callback);
                                    }
                                } else {
                                    forEach(value, function(property) {
                                        update(value, property, callback);
                                    });
                                }
                            }
                            return callback.call(source, property, value);
                        };
                        exports.parse = function(source, callback) {
                            var result, value;
                            Index = 0;
                            Source = "" + source;
                            result = get(lex());
                            if (lex() != "$") {
                                abort();
                            }
                            Index = Source = null;
                            return callback && getClass.call(callback) == functionClass ? walk((value = {}, 
                            value[""] = result, value), "", callback) : result;
                        };
                    }
                }
                exports["runInContext"] = runInContext;
                return exports;
            }
            if (freeExports && !isLoader) {
                runInContext(root, freeExports);
            } else {
                var nativeJSON = root.JSON, previousJSON = root["JSON3"], isRestored = false;
                var JSON3 = runInContext(root, root["JSON3"] = {
                    "noConflict": function() {
                        if (!isRestored) {
                            isRestored = true;
                            root.JSON = nativeJSON;
                            root["JSON3"] = previousJSON;
                            nativeJSON = previousJSON = null;
                        }
                        return JSON3;
                    }
                });
                root.JSON = {
                    "parse": JSON3.parse,
                    "stringify": JSON3.stringify
                };
            }
            if (isLoader) {
                !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                    return JSON3;
                }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            }
        }).call(this);
    }).call(exports, __webpack_require__(51)(module), function() {
        return this;
    }());
}, function(module, exports) {
    module.exports = function(module) {
        if (!module.webpackPolyfill) {
            module.deprecate = function() {};
            module.paths = [];
            module.children = [];
            module.webpackPolyfill = 1;
        }
        return module;
    };
}, function(module, exports) {
    (function(__webpack_amd_options__) {
        module.exports = __webpack_amd_options__;
    }).call(exports, {});
}, function(module, exports) {
    var cc = String.fromCharCode;
    var m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    function encode(n) {
        var o = "";
        var i = 0;
        var i1, i2, i3, e1, e2, e3, e4;
        n = utf8Encode(n);
        while (i < n.length) {
            i1 = n.charCodeAt(i++);
            i2 = n.charCodeAt(i++);
            i3 = n.charCodeAt(i++);
            e1 = i1 >> 2;
            e2 = (i1 & 3) << 4 | i2 >> 4;
            e3 = isNaN(i2) ? 64 : (i2 & 15) << 2 | i3 >> 6;
            e4 = isNaN(i2) || isNaN(i3) ? 64 : i3 & 63;
            o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4);
        }
        return o;
    }
    function utf8Encode(n) {
        var o = "";
        var i = 0;
        var c;
        while (i < n.length) {
            c = n.charCodeAt(i++);
            o = o + (c < 128 ? cc(c) : c > 127 && c < 2048 ? cc(c >> 6 | 192) + cc(c & 63 | 128) : cc(c >> 12 | 224) + cc(c >> 6 & 63 | 128) + cc(c & 63 | 128));
        }
        return o;
    }
    module.exports = encode;
}, function(module, exports, __webpack_require__) {
    var _ = __webpack_require__(8);
    var invariant = __webpack_require__(3).invariant;
    function validateOptions(options) {
        invariant(_.isObject(options), "Check out our JavaScript SDK Usage Guide: " + "http://docs.treasuredata.com/articles/javascript-sdk");
        invariant(_.isString(options.writeKey), "Must provide a writeKey");
        invariant(_.isString(options.database), "Must provide a database");
        invariant(/^[a-z0-9_]{3,255}$/.test(options.database), "Database must be between 3 and 255 characters and must " + "consist only of lower case letters, numbers, and _");
    }
    exports.DEFAULT_CONFIG = {
        "development": false,
        "globalIdCookie": "_td_global",
        "host": "in.treasuredata.com",
        "logging": true,
        "pathname": "/js/v3/event/",
        "protocol": document.location.protocol === "https:" ? "https:" : "http:",
        "requestType": "jsonp"
    };
    exports.configure = function configure(options) {
        this.client = _.assign({
            "globals": {}
        }, exports.DEFAULT_CONFIG, options, {
            "requestType": "jsonp"
        });
        validateOptions(this.client);
        if (!/:$/.test(this.client.protocol)) {
            this.client.protocol += ":";
        }
        if (!this.client.endpoint) {
            this.client.endpoint = this.client.protocol + "//" + this.client.host + this.client.pathname;
        }
        return this;
    };
    exports.set = function set(table, property, value) {
        if (_.isObject(table)) {
            property = table;
            table = "$global";
        }
        this.client.globals[table] = this.client.globals[table] || {};
        if (_.isObject(property)) {
            _.assign(this.client.globals[table], property);
        } else {
            this.client.globals[table][property] = value;
        }
        return this;
    };
    exports.get = function get(table, key) {
        table = table || "$global";
        this.client.globals[table] = this.client.globals[table] || {};
        return key ? this.client.globals[table][key] : this.client.globals[table];
    };
}, function(module, exports) {
    module.exports = "1.8.5-beta1";
}, function(module, exports, __webpack_require__) {
    /*!
	  * domready (c) Dustin Diaz 2012 - License MIT
	  */
    !function(name, definition) {
        if (true) module.exports = definition(); else if (typeof define == "function" && typeof define.amd == "object") define(definition); else this[name] = definition();
    }("domready", function(ready) {
        var fns = [], fn, f = false, doc = document, testEl = doc.documentElement, hack = testEl.doScroll, domContentLoaded = "DOMContentLoaded", addEventListener = "addEventListener", onreadystatechange = "onreadystatechange", readyState = "readyState", loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/, loaded = loadedRgx.test(doc[readyState]);
        function flush(f) {
            loaded = 1;
            while (f = fns.shift()) f();
        }
        doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function() {
            doc.removeEventListener(domContentLoaded, fn, f);
            flush();
        }, f);
        hack && doc.attachEvent(onreadystatechange, fn = function() {
            if (/^c/.test(doc[readyState])) {
                doc.detachEvent(onreadystatechange, fn);
                flush();
            }
        });
        return ready = hack ? function(fn) {
            self != top ? loaded ? fn() : fns.push(fn) : function() {
                try {
                    testEl.doScroll("left");
                } catch (e) {
                    return setTimeout(function() {
                        ready(fn);
                    }, 50);
                }
                fn();
            }();
        } : function(fn) {
            loaded ? fn() : fns.push(fn);
        };
    });
}, function(module, exports, __webpack_require__) {
    var window = __webpack_require__(58);
    var elementUtils = __webpack_require__(59);
    var assign = __webpack_require__(8).assign;
    var disposable = __webpack_require__(3).disposable;
    function defaultExtendClickData(event, data) {
        return data;
    }
    function configure() {
        this._clickTrackingInstalled = false;
    }
    function trackClicks(trackClicksOptions) {
        if (this._clickTrackingInstalled) return;
        var instance = this;
        var options = assign({
            "element": window.document,
            "extendClickData": defaultExtendClickData,
            "ignoreAttribute": "td-ignore"
        }, trackClicksOptions);
        var treeHasIgnoreAttribute = elementUtils.createTreeHasIgnoreAttribute(options.ignoreAttribute);
        var removeClickTracker = elementUtils.addEventListener(options.element, "click", clickTracker);
        instance._clickTrackingInstalled = true;
        return disposable(function() {
            removeClickTracker();
            instance._clickTrackingInstalled = false;
        });
        function clickTracker(e) {
            var target = elementUtils.findElement(elementUtils.getEventTarget(e));
            if (target && !treeHasIgnoreAttribute(target)) {
                var elementData = elementUtils.getElementData(target);
                var data = options.extendClickData(e, elementData);
                if (data) {
                    instance.trackEvent("clicks", data);
                }
            }
        }
    }
    module.exports = {
        "configure": configure,
        "trackClicks": trackClicks
    };
}, function(module, exports) {
    (function(global) {
        if (typeof window !== "undefined") {
            module.exports = window;
        } else if (typeof global !== "undefined") {
            module.exports = global;
        } else if (typeof self !== "undefined") {
            module.exports = self;
        } else {
            module.exports = {};
        }
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports, __webpack_require__) {
    var forEach = __webpack_require__(8).forEach;
    var isString = __webpack_require__(8).isString;
    var disposable = __webpack_require__(3).disposable;
    function getEventTarget(event) {
        var target = event.target || event.srcElement || window.document;
        return target.nodeType === 3 ? target.parentNode : target;
    }
    function addEventListener(el, type, fn) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
            return disposable(function() {
                el.removeEventListener(type, handler, false);
            });
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, handler);
            return disposable(function() {
                el.detachEvent("on" + type, handler);
            });
        } else {
            throw new Error("addEventListener");
        }
        function handler(event) {
            fn.call(el, event || window.event);
        }
    }
    function findElement(el) {
        if (!el || !el.tagName) {
            return null;
        }
        for (var tag = el.tagName.toLowerCase(); tag && tag !== "body"; el = el.parentNode, 
        tag = el && el.tagName.toLowerCase()) {
            var type = el.getAttribute("type");
            if (tag === "input" && type === "password") {
                return null;
            }
            var role = el.getAttribute("role");
            if (role === "button" || role === "link" || tag === "a" || tag === "button" || tag === "input") {
                return el;
            }
        }
        return null;
    }
    function createTreeHasIgnoreAttribute(ignoreAttribute) {
        var dataIgnoreAttribute = "data-" + ignoreAttribute;
        return function treeHasIgnoreAttribute(el) {
            if (!el || !el.tagName || el.tagName.toLowerCase() === "html") {
                return false;
            } else if (hasAttribute(el, ignoreAttribute) || hasAttribute(el, dataIgnoreAttribute)) {
                return true;
            } else {
                return treeHasIgnoreAttribute(el.parentNode);
            }
        };
    }
    function getElementData(el) {
        var data = {
            "tag": el.tagName.toLowerCase(),
            "tree": htmlTreeAsString(el)
        };
        forEach([ "alt", "class", "href", "id", "name", "role", "title", "type" ], function(attrName) {
            if (hasAttribute(el, attrName)) {
                data[attrName] = el.getAttribute(attrName);
            }
        });
        return data;
    }
    function htmlTreeAsString(elem) {
        var MAX_TRAVERSE_HEIGHT = 5;
        var MAX_OUTPUT_LEN = 80;
        var out = [];
        var height = 0;
        var len = 0;
        var separator = " > ";
        var sepLength = separator.length;
        var nextStr;
        while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
            nextStr = htmlElementAsString(elem);
            if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN) {
                break;
            }
            out.push(nextStr);
            len += nextStr.length;
            elem = elem.parentNode;
        }
        return out.reverse().join(separator);
    }
    function htmlElementAsString(elem) {
        var out = [];
        var className;
        var classes;
        var key;
        var attr;
        var i;
        if (!elem || !elem.tagName) {
            return "";
        }
        out.push(elem.tagName.toLowerCase());
        if (elem.id) {
            out.push("#" + elem.id);
        }
        className = elem.className;
        if (className && isString(className)) {
            classes = className.split(" ");
            for (i = 0; i < classes.length; i++) {
                out.push("." + classes[i]);
            }
        }
        var attrWhitelist = [ "type", "name", "title", "alt" ];
        for (i = 0; i < attrWhitelist.length; i++) {
            key = attrWhitelist[i];
            attr = elem.getAttribute(key);
            if (attr) {
                out.push("[" + key + '="' + attr + '"]');
            }
        }
        return out.join("");
    }
    function hasAttribute(element, attrName) {
        if (typeof element.hasAttribute === "function") {
            return element.hasAttribute(attrName);
        }
        return element.getAttribute(attrName) !== null;
    }
    module.exports = {
        "addEventListener": addEventListener,
        "createTreeHasIgnoreAttribute": createTreeHasIgnoreAttribute,
        "getElementData": getElementData,
        "getEventTarget": getEventTarget,
        "hasAttribute": hasAttribute,
        "htmlElementAsString": htmlElementAsString,
        "htmlTreeAsString": htmlTreeAsString,
        "findElement": findElement
    };
}, function(module, exports, __webpack_require__) {
    var jsonp = __webpack_require__(4);
    var invariant = __webpack_require__(3).invariant;
    var noop = __webpack_require__(3).noop;
    var cookie = __webpack_require__(61);
    function cacheSuccess(result, cookieName) {
        cookie.setItem(cookieName, result["global_id"], 6e3);
        return result["global_id"];
    }
    function configure() {}
    function fetchGlobalID(success, error, forceFetch) {
        success = success || noop;
        error = error || noop;
        var cookieName = this.client.globalIdCookie;
        var cachedGlobalId = cookie.getItem(this.client.globalIdCookie);
        if (cachedGlobalId && !forceFetch) {
            return setTimeout(function() {
                success(cachedGlobalId);
            }, 0);
        }
        var url = this.client.protocol + "//" + this.client.host + "/js/v3/global_id";
        invariant(this.client.requestType === "jsonp", "Request type " + this.client.requestType + " not supported");
        jsonp(url, {
            "prefix": "TreasureJSONPCallback",
            "timeout": 1e4
        }, function(err, res) {
            return err ? error(err) : success(cacheSuccess(res, cookieName));
        });
    }
    module.exports = {
        "cacheSuccess": cacheSuccess,
        "configure": configure,
        "fetchGlobalID": fetchGlobalID
    };
}, function(module, exports) {
    var encode = function encode(val) {
        try {
            return encodeURIComponent(val);
        } catch (e) {
            console.error("error encode %o");
        }
        return null;
    };
    var decode = function decode(val) {
        try {
            return decodeURIComponent(val);
        } catch (err) {
            console.error("error decode %o");
        }
        return null;
    };
    var handleSkey = function handleSkey(sKey) {
        return encode(sKey).replace(/[\-\.\+\*]/g, "\\$&");
    };
    var Cookies = {
        "getItem": function getItem(sKey) {
            if (!sKey) {
                return null;
            }
            return decode(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + handleSkey(sKey) + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        "setItem": function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                  case Number:
                    if (vEnd === Infinity) {
                        sExpires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
                    } else {
                        sExpires = "; max-age=" + vEnd;
                    }
                    break;

                  case String:
                    sExpires = "; expires=" + vEnd;
                    break;

                  case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;

                  default:
                    break;
                }
            }
            document.cookie = [ encode(sKey), "=", encode(sValue), sExpires, sDomain ? "; domain=" + sDomain : "", sPath ? "; path=" + sPath : "", bSecure ? "; secure" : "" ].join("");
            return true;
        },
        "removeItem": function removeItem(sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) {
                return false;
            }
            document.cookie = [ encode(sKey), "=; expires=Thu, 01 Jan 1970 00:00:00 GMT", sDomain ? "; domain=" + sDomain : "", sPath ? "; path=" + sPath : "" ].join("");
            return true;
        },
        "hasItem": function hasItem(sKey) {
            if (!sKey) {
                return false;
            }
            return new RegExp("(?:^|;\\s*)" + encode(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie);
        },
        "keys": function keys() {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:=[^;]*)?;\s*/);
            aKeys = aKeys.map(function(key) {
                return decode(key);
            });
            return aKeys;
        }
    };
    module.exports = Cookies;
}, function(module, exports, __webpack_require__) {
    var jsonp = __webpack_require__(4);
    var noop = __webpack_require__(3).noop;
    var invariant = __webpack_require__(3).invariant;
    function fetchUserSegments(audienceToken, successCallback, errorCallback) {
        successCallback = successCallback || noop;
        errorCallback = errorCallback || noop;
        invariant(typeof audienceToken === "string", 'audienceToken must be a string; received "' + audienceToken.toString() + '"');
        var url = this.client.protocol + "//cdp." + this.client.host + "/cdp/lookup/collect/segments?token=" + audienceToken;
        jsonp(url, {
            "prefix": "TreasureJSONPCallback",
            "timeout": 1e4
        }, function(err, res) {
            return err ? errorCallback(err) : successCallback(res && res.key, res && res.values);
        });
    }
    module.exports = {
        "configure": noop,
        "fetchUserSegments": fetchUserSegments
    };
}, function(module, exports, __webpack_require__) {
    /*!
	* ----------------------
	* Treasure Tracker
	* ----------------------
	*/
    var window = __webpack_require__(58);
    var _ = __webpack_require__(8);
    var cookie = __webpack_require__(61);
    var generateUUID = __webpack_require__(64);
    var version = __webpack_require__(55);
    var document = window.document;
    function configureValues(track) {
        return _.assign({
            "td_version": function() {
                return version;
            },
            "td_client_id": function() {
                return track.uuid;
            },
            "td_charset": function() {
                return (document.characterSet || document.charset || "-").toLowerCase();
            },
            "td_language": function() {
                var nav = window.navigator;
                return (nav && (nav.language || nav.browserLanguage) || "-").toLowerCase();
            },
            "td_color": function() {
                return window.screen ? window.screen.colorDepth + "-bit" : "-";
            },
            "td_screen": function() {
                return window.screen ? window.screen.width + "x" + window.screen.height : "-";
            },
            "td_viewport": function() {
                var clientHeight = document.documentElement && document.documentElement.clientHeight;
                var clientWidth = document.documentElement && document.documentElement.clientWidth;
                var innerHeight = window.innerHeight;
                var innerWidth = window.innerWidth;
                var height = clientHeight < innerHeight ? innerHeight : clientHeight;
                var width = clientWidth < innerWidth ? innerWidth : clientWidth;
                return width + "x" + height;
            },
            "td_title": function() {
                return document.title;
            },
            "td_url": function() {
                return document.location.href.split("#")[0];
            },
            "td_user_agent": function() {
                return window.navigator.userAgent;
            },
            "td_platform": function() {
                return window.navigator.platform;
            },
            "td_host": function() {
                return document.location.host;
            },
            "td_path": function() {
                return document.location.pathname;
            },
            "td_referrer": function() {
                return document.referrer;
            },
            "td_ip": function() {
                return "td_ip";
            },
            "td_browser": function() {
                return "td_browser";
            },
            "td_browser_version": function() {
                return "td_browser_version";
            },
            "td_os": function() {
                return "td_os";
            },
            "td_os_version": function() {
                return "td_os_version";
            }
        }, track.values);
    }
    function configureTrack(track) {
        return _.assign({
            "pageviews": "pageviews",
            "events": "events",
            "values": {}
        }, track);
    }
    function configureStorage(storage) {
        if (storage === "none") {
            return false;
        }
        storage = _.isObject(storage) ? storage : {};
        return _.assign({
            "name": "_td",
            "expires": 63072e3,
            "domain": document.location.hostname,
            "customDomain": !!storage.domain,
            "path": "/"
        }, storage);
    }
    function findDomains(domain) {
        var domainChunks = domain.split(".");
        var domains = [];
        for (var i = domainChunks.length - 1; i >= 0; i--) {
            domains.push(domainChunks.slice(i).join("."));
        }
        return domains;
    }
    exports.configure = function configure(config) {
        config = _.isObject(config) ? config : {};
        this.client.track = config.track = configureTrack(config.track);
        this.client.storage = config.storage = configureStorage(config.storage);
        if (_.isNumber(config.clientId)) {
            config.clientId = config.clientId.toString();
        } else if (!config.clientId || !_.isString(config.clientId)) {
            if (config.storage && config.storage.name) {
                config.clientId = cookie.getItem(config.storage.name);
            }
            if (!config.clientId || config.clientId === "undefined") {
                config.clientId = generateUUID();
            }
        }
        this.client.track.uuid = config.clientId.replace(/\0/g, "");
        var setCookie = function(storage, uuid) {
            var clone = _.assign({}, storage);
            var is = {
                "ip": storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
                "local": storage.domain === "localhost",
                "custom": storage.customDomain
            };
            if (is.ip || is.local || is.custom) {
                clone.domain = is.local ? null : clone.domain;
                cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain);
            } else {
                var domains = findDomains(storage.domain);
                var ll = domains.length;
                var i = 0;
                if (!uuid) {
                    for (;i < ll; i++) {
                        cookie.removeItem(storage.name, storage.path, domains[i]);
                    }
                } else {
                    for (;i < ll; i++) {
                        clone.domain = domains[i];
                        cookie.setItem(storage.name, uuid, clone.expiry, clone.path, clone.domain);
                        if (cookie.getItem(storage.name) === uuid) {
                            storage.domain = clone.domain;
                            break;
                        }
                    }
                }
            }
        };
        if (config.storage) {
            if (config.storage.expires) {
                setCookie(config.storage, undefined);
                setCookie(config.storage, this.client.track.uuid);
            }
        }
        this.client.track.values = _.assign(configureValues(this.client.track), this.client.track.values);
        return this;
    };
    exports.trackEvent = function trackEvent(table, record, success, failure) {
        if (!table) {
            table = this.client.track.events;
        }
        record = _.assign(this.getTrackValues(), record);
        this.addRecord(table, record, success, failure);
        return this;
    };
    exports.trackPageview = function trackPageview(table, success, failure) {
        if (!table) {
            table = this.client.track.pageviews;
        }
        this.trackEvent(table, {}, success, failure);
        return this;
    };
    exports.getTrackValues = function getTrackValues() {
        var result = {};
        _.forIn(this.client.track.values, function(value, key) {
            if (value) {
                result[key] = typeof value === "function" ? value() : value;
            }
        });
        return result;
    };
}, function(module, exports, __webpack_require__) {
    var window = __webpack_require__(58);
    module.exports = function generateUUID() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += window.performance.now();
        }
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : r & 3 | 8).toString(16);
        });
        return uuid;
    };
}, function(module, exports, __webpack_require__) {
    var _ = __webpack_require__(8);
    var window = __webpack_require__(58);
    function applyToClient(client, method) {
        var _method = "_" + method;
        if (client[_method]) {
            var arr = client[_method] || [];
            while (arr.length) {
                client[method].apply(client, arr.shift());
            }
            delete client[_method];
        }
    }
    var TREASURE_KEYS = [ "init", "set", "addRecord", "fetchGlobalID", "trackPageview", "trackEvent", "trackClicks", "fetchUserSegments", "ready" ];
    module.exports = function loadClients(Treasure, name) {
        if (_.isObject(window[name])) {
            var snippet = window[name];
            var clients = snippet.clients;
            _.forIn(Treasure.prototype, function(value, key) {
                snippet.prototype[key] = value;
            });
            _.forEach(clients, function(client) {
                _.forEach(TREASURE_KEYS, function(value) {
                    applyToClient(client, value);
                });
            });
        }
    };
} ]);