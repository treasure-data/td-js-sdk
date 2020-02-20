(function() {
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
    function _timeout(milliseconds, promise, timeoutMessage) {
        var timerPromise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject(new Error(timeoutMessage || "Operation Timeout"));
            }, milliseconds);
        });
        return Promise.race([ timerPromise, promise ]);
    }
    function fetchWithTimeout(url, milliseconds, options) {
        if (window.AbortController) {
            var controller = new window.AbortController();
            var promise = window.fetch(url, Object.assign({}, options, {
                "signal": controller.signal
            }));
            var timeoutId = setTimeout(function() {
                controller.abort();
            }, milliseconds);
            return promise["finally"](function() {
                clearTimeout(timeoutId);
            });
        } else {
            return _timeout(milliseconds, window.fetch(url, options), "Request Timeout");
        }
    }
    var misc = {
        "disposable": disposable,
        "invariant": invariant,
        "noop": noop,
        "fetchWithTimeout": fetchWithTimeout
    };
    var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    function createCommonjsModule(fn, module) {
        return module = {
            "exports": {}
        }, fn(module, module.exports), module.exports;
    }
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    var ms = function(val, options) {
        options = options || {};
        var type = typeof val;
        if (type === "string" && val.length > 0) {
            return parse(val);
        } else if (type === "number" && isNaN(val) === false) {
            return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
        str = String(str);
        if (str.length > 100) {
            return;
        }
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
        if (!match) {
            return;
        }
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

          default:
            return undefined;
        }
    }
    function fmtShort(ms) {
        if (ms >= d) {
            return Math.round(ms / d) + "d";
        }
        if (ms >= h) {
            return Math.round(ms / h) + "h";
        }
        if (ms >= m) {
            return Math.round(ms / m) + "m";
        }
        if (ms >= s) {
            return Math.round(ms / s) + "s";
        }
        return ms + "ms";
    }
    function fmtLong(ms) {
        return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
        if (ms < n) {
            return;
        }
        if (ms < n * 1.5) {
            return Math.floor(ms / n) + " " + name;
        }
        return Math.ceil(ms / n) + " " + name + "s";
    }
    var debug = createCommonjsModule(function(module, exports) {
        exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
        exports.coerce = coerce;
        exports.disable = disable;
        exports.enable = enable;
        exports.enabled = enabled;
        exports.humanize = ms;
        exports.names = [];
        exports.skips = [];
        exports.formatters = {};
        var prevTime;
        function selectColor(namespace) {
            var hash = 0, i;
            for (i in namespace) {
                hash = (hash << 5) - hash + namespace.charCodeAt(i);
                hash |= 0;
            }
            return exports.colors[Math.abs(hash) % exports.colors.length];
        }
        function createDebug(namespace) {
            function debug() {
                if (!debug.enabled) return;
                var self = debug;
                var curr = +new Date();
                var ms = curr - (prevTime || curr);
                self.diff = ms;
                self.prev = prevTime;
                self.curr = curr;
                prevTime = curr;
                var args = new Array(arguments.length);
                for (var i = 0; i < args.length; i++) {
                    args[i] = arguments[i];
                }
                args[0] = exports.coerce(args[0]);
                if ("string" !== typeof args[0]) {
                    args.unshift("%O");
                }
                var index = 0;
                args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
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
                exports.formatArgs.call(self, args);
                var logFn = debug.log || exports.log || console.log.bind(console);
                logFn.apply(self, args);
            }
            debug.namespace = namespace;
            debug.enabled = exports.enabled(namespace);
            debug.useColors = exports.useColors();
            debug.color = selectColor(namespace);
            if ("function" === typeof exports.init) {
                exports.init(debug);
            }
            return debug;
        }
        function enable(namespaces) {
            exports.save(namespaces);
            exports.names = [];
            exports.skips = [];
            var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
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
    });
    var debug_1 = debug.coerce;
    var debug_2 = debug.disable;
    var debug_3 = debug.enable;
    var debug_4 = debug.enabled;
    var debug_5 = debug.humanize;
    var debug_6 = debug.names;
    var debug_7 = debug.skips;
    var debug_8 = debug.formatters;
    var browser = createCommonjsModule(function(module, exports) {
        exports = module.exports = debug;
        exports.log = log;
        exports.formatArgs = formatArgs;
        exports.save = save;
        exports.load = load;
        exports.useColors = useColors;
        exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
        exports.colors = [ "lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson" ];
        function useColors() {
            if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
                return true;
            }
            return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
        }
        exports.formatters.j = function(v) {
            try {
                return JSON.stringify(v);
            } catch (err) {
                return "[UnexpectedJSONParseError]: " + err.message;
            }
        };
        function formatArgs(args) {
            var useColors = this.useColors;
            args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff);
            if (!useColors) return;
            var c = "color: " + this.color;
            args.splice(1, 0, c, "color: inherit");
            var index = 0;
            var lastC = 0;
            args[0].replace(/%[a-zA-Z%]/g, function(match) {
                if ("%%" === match) return;
                index++;
                if ("%c" === match) {
                    lastC = index;
                }
            });
            args.splice(lastC, 0, c);
        }
        function log() {
            return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
        }
        function save(namespaces) {
            try {
                if (null == namespaces) {
                    exports.storage.removeItem("debug");
                } else {
                    exports.storage.debug = namespaces;
                }
            } catch (e) {}
        }
        function load() {
            var r;
            try {
                r = exports.storage.debug;
            } catch (e) {}
            if (!r && typeof process !== "undefined" && "env" in process) {
                r = process.env.DEBUG;
            }
            return r;
        }
        exports.enable(load());
        function localstorage() {
            try {
                return window.localStorage;
            } catch (e) {}
        }
    });
    var browser_1 = browser.log;
    var browser_2 = browser.formatArgs;
    var browser_3 = browser.save;
    var browser_4 = browser.load;
    var browser_5 = browser.useColors;
    var browser_6 = browser.storage;
    var browser_7 = browser.colors;
    var debug$1 = browser("jsonp");
    var jsonp_1 = jsonp;
    var count = 0;
    function noop$1() {}
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
            window[id] = noop$1;
            if (timer) clearTimeout(timer);
        }
        function cancel() {
            if (window[id]) {
                cleanup();
            }
        }
        window[id] = function(data) {
            debug$1("jsonp got", data);
            cleanup();
            if (fn) fn(null, data);
        };
        url += (~url.indexOf("?") ? "&" : "?") + param + "=" + enc(id);
        url = url.replace("?&", "?");
        debug$1('jsonp req "%s"', url);
        script = document.createElement("script");
        script.src = url;
        target.parentNode.insertBefore(script, target);
        return cancel;
    }
    function arrayEach(array, iteratee) {
        var index = -1, length = array.length;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    var arrayEach_1 = arrayEach;
    function isObject(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
    }
    var isObject_1 = isObject;
    function isObjectLike(value) {
        return !!value && typeof value == "object";
    }
    var isObjectLike_1 = isObjectLike;
    var stringTag = "[object String]";
    var objectProto = Object.prototype;
    var objToString = objectProto.toString;
    function isString(value) {
        return typeof value == "string" || isObjectLike_1(value) && objToString.call(value) == stringTag;
    }
    var isString_1 = isString;
    var arrayProto = Array.prototype, errorProto = Error.prototype, objectProto$1 = Object.prototype;
    var propertyIsEnumerable = objectProto$1.propertyIsEnumerable, splice = arrayProto.splice;
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
    })(1);
    var support_1 = support;
    function toObject(value) {
        if (support_1.unindexedChars && isString_1(value)) {
            var index = -1, length = value.length, result = Object(value);
            while (++index < length) {
                result[index] = value.charAt(index);
            }
            return result;
        }
        return isObject_1(value) ? value : Object(value);
    }
    var toObject_1 = toObject;
    function createBaseFor(fromRight) {
        return function(object, iteratee, keysFunc) {
            var iterable = toObject_1(object), props = keysFunc(object), length = props.length, index = fromRight ? length : -1;
            while (fromRight ? index-- : ++index < length) {
                var key = props[index];
                if (iteratee(iterable[key], key, iterable) === false) {
                    break;
                }
            }
            return object;
        };
    }
    var createBaseFor_1 = createBaseFor;
    var baseFor = createBaseFor_1();
    var baseFor_1 = baseFor;
    var funcTag = "[object Function]";
    var objectProto$2 = Object.prototype;
    var objToString$1 = objectProto$2.toString;
    function isFunction(value) {
        return isObject_1(value) && objToString$1.call(value) == funcTag;
    }
    var isFunction_1 = isFunction;
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
    var isHostObject_1 = isHostObject;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var objectProto$3 = Object.prototype;
    var fnToString = Function.prototype.toString;
    var hasOwnProperty = objectProto$3.hasOwnProperty;
    var reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    function isNative(value) {
        if (value == null) {
            return false;
        }
        if (isFunction_1(value)) {
            return reIsNative.test(fnToString.call(value));
        }
        return isObjectLike_1(value) && (isHostObject_1(value) ? reIsNative : reIsHostCtor).test(value);
    }
    var isNative_1 = isNative;
    function getNative(object, key) {
        var value = object == null ? undefined : object[key];
        return isNative_1(value) ? value : undefined;
    }
    var getNative_1 = getNative;
    function baseProperty(key) {
        return function(object) {
            return object == null ? undefined : toObject_1(object)[key];
        };
    }
    var baseProperty_1 = baseProperty;
    var getLength = baseProperty_1("length");
    var getLength_1 = getLength;
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    var isLength_1 = isLength;
    function isArrayLike(value) {
        return value != null && isLength_1(getLength_1(value));
    }
    var isArrayLike_1 = isArrayLike;
    var objectProto$4 = Object.prototype;
    var hasOwnProperty$1 = objectProto$4.hasOwnProperty;
    var propertyIsEnumerable$1 = objectProto$4.propertyIsEnumerable;
    function isArguments(value) {
        return isObjectLike_1(value) && isArrayLike_1(value) && hasOwnProperty$1.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
    }
    var isArguments_1 = isArguments;
    var arrayTag = "[object Array]";
    var objectProto$5 = Object.prototype;
    var objToString$2 = objectProto$5.toString;
    var nativeIsArray = getNative_1(Array, "isArray");
    var isArray = nativeIsArray || function(value) {
        return isObjectLike_1(value) && isLength_1(value.length) && objToString$2.call(value) == arrayTag;
    };
    var isArray_1 = isArray;
    var reIsUint = /^\d+$/;
    var MAX_SAFE_INTEGER$1 = 9007199254740991;
    function isIndex(value, length) {
        value = typeof value == "number" || reIsUint.test(value) ? +value : -1;
        length = length == null ? MAX_SAFE_INTEGER$1 : length;
        return value > -1 && value % 1 == 0 && value < length;
    }
    var isIndex_1 = isIndex;
    var arrayTag$1 = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag$1 = "[object Function]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", stringTag$1 = "[object String]";
    var shadowProps = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];
    var errorProto$1 = Error.prototype, objectProto$6 = Object.prototype, stringProto = String.prototype;
    var hasOwnProperty$2 = objectProto$6.hasOwnProperty;
    var objToString$3 = objectProto$6.toString;
    var nonEnumProps = {};
    nonEnumProps[arrayTag$1] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = {
        "constructor": true,
        "toLocaleString": true,
        "toString": true,
        "valueOf": true
    };
    nonEnumProps[boolTag] = nonEnumProps[stringTag$1] = {
        "constructor": true,
        "toString": true,
        "valueOf": true
    };
    nonEnumProps[errorTag] = nonEnumProps[funcTag$1] = nonEnumProps[regexpTag] = {
        "constructor": true,
        "toString": true
    };
    nonEnumProps[objectTag] = {
        "constructor": true
    };
    arrayEach_1(shadowProps, function(key) {
        for (var tag in nonEnumProps) {
            if (hasOwnProperty$2.call(nonEnumProps, tag)) {
                var props = nonEnumProps[tag];
                props[key] = hasOwnProperty$2.call(props, key);
            }
        }
    });
    function keysIn(object) {
        if (object == null) {
            return [];
        }
        if (!isObject_1(object)) {
            object = Object(object);
        }
        var length = object.length;
        length = length && isLength_1(length) && (isArray_1(object) || isArguments_1(object) || isString_1(object)) && length || 0;
        var Ctor = object.constructor, index = -1, proto = isFunction_1(Ctor) && Ctor.prototype || objectProto$6, isProto = proto === object, result = Array(length), skipIndexes = length > 0, skipErrorProps = support_1.enumErrorProps && (object === errorProto$1 || object instanceof Error), skipProto = support_1.enumPrototypes && isFunction_1(object);
        while (++index < length) {
            result[index] = index + "";
        }
        for (var key in object) {
            if (!(skipProto && key == "prototype") && !(skipErrorProps && (key == "message" || key == "name")) && !(skipIndexes && isIndex_1(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty$2.call(object, key)))) {
                result.push(key);
            }
        }
        if (support_1.nonEnumShadows && object !== objectProto$6) {
            var tag = object === stringProto ? stringTag$1 : object === errorProto$1 ? errorTag : objToString$3.call(object), nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];
            if (tag == objectTag) {
                proto = objectProto$6;
            }
            length = shadowProps.length;
            while (length--) {
                key = shadowProps[length];
                var nonEnum = nonEnums[key];
                if (!(isProto && nonEnum) && (nonEnum ? hasOwnProperty$2.call(object, key) : object[key] !== proto[key])) {
                    result.push(key);
                }
            }
        }
        return result;
    }
    var keysIn_1 = keysIn;
    var objectProto$7 = Object.prototype;
    var hasOwnProperty$3 = objectProto$7.hasOwnProperty;
    function shimKeys(object) {
        var props = keysIn_1(object), propsLength = props.length, length = propsLength && object.length;
        var allowIndexes = !!length && isLength_1(length) && (isArray_1(object) || isArguments_1(object) || isString_1(object));
        var index = -1, result = [];
        while (++index < propsLength) {
            var key = props[index];
            if (allowIndexes && isIndex_1(key, length) || hasOwnProperty$3.call(object, key)) {
                result.push(key);
            }
        }
        return result;
    }
    var shimKeys_1 = shimKeys;
    var nativeKeys = getNative_1(Object, "keys");
    var keys = !nativeKeys ? shimKeys_1 : function(object) {
        var Ctor = object == null ? undefined : object.constructor;
        if (typeof Ctor == "function" && Ctor.prototype === object || (typeof object == "function" ? support_1.enumPrototypes : isArrayLike_1(object))) {
            return shimKeys_1(object);
        }
        return isObject_1(object) ? nativeKeys(object) : [];
    };
    var keys_1 = keys;
    function baseForOwn(object, iteratee) {
        return baseFor_1(object, iteratee, keys_1);
    }
    var baseForOwn_1 = baseForOwn;
    function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
            var length = collection ? getLength_1(collection) : 0;
            if (!isLength_1(length)) {
                return eachFunc(collection, iteratee);
            }
            var index = fromRight ? length : -1, iterable = toObject_1(collection);
            while (fromRight ? index-- : ++index < length) {
                if (iteratee(iterable[index], index, iterable) === false) {
                    break;
                }
            }
            return collection;
        };
    }
    var createBaseEach_1 = createBaseEach;
    var baseEach = createBaseEach_1(baseForOwn_1);
    var baseEach_1 = baseEach;
    function identity(value) {
        return value;
    }
    var identity_1 = identity;
    function bindCallback(func, thisArg, argCount) {
        if (typeof func != "function") {
            return identity_1;
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
    var bindCallback_1 = bindCallback;
    function createForEach(arrayFunc, eachFunc) {
        return function(collection, iteratee, thisArg) {
            return typeof iteratee == "function" && thisArg === undefined && isArray_1(collection) ? arrayFunc(collection, iteratee) : eachFunc(collection, bindCallback_1(iteratee, thisArg, 3));
        };
    }
    var createForEach_1 = createForEach;
    var forEach = createForEach_1(arrayEach_1, baseEach_1);
    var forEach_1 = forEach;
    var numberTag$1 = "[object Number]";
    var objectProto$8 = Object.prototype;
    var objToString$4 = objectProto$8.toString;
    function isNumber(value) {
        return typeof value == "number" || isObjectLike_1(value) && objToString$4.call(value) == numberTag$1;
    }
    var isNumber_1 = isNumber;
    function assignWith(object, source, customizer) {
        var index = -1, props = keys_1(source), length = props.length;
        while (++index < length) {
            var key = props[index], value = object[key], result = customizer(value, source[key], key, object, source);
            if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
                object[key] = result;
            }
        }
        return object;
    }
    var assignWith_1 = assignWith;
    function baseCopy(source, props, object) {
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
            var key = props[index];
            object[key] = source[key];
        }
        return object;
    }
    var baseCopy_1 = baseCopy;
    function baseAssign(object, source) {
        return source == null ? object : baseCopy_1(source, keys_1(source), object);
    }
    var baseAssign_1 = baseAssign;
    function isIterateeCall(value, index, object) {
        if (!isObject_1(object)) {
            return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike_1(object) && isIndex_1(index, object.length) : type == "string" && index in object) {
            var other = object[index];
            return value === value ? value === other : other !== other;
        }
        return false;
    }
    var isIterateeCall_1 = isIterateeCall;
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
    var restParam_1 = restParam;
    function createAssigner(assigner) {
        return restParam_1(function(object, sources) {
            var index = -1, length = object == null ? 0 : sources.length, customizer = length > 2 ? sources[length - 2] : undefined, guard = length > 2 ? sources[2] : undefined, thisArg = length > 1 ? sources[length - 1] : undefined;
            if (typeof customizer == "function") {
                customizer = bindCallback_1(customizer, thisArg, 5);
                length -= 2;
            } else {
                customizer = typeof thisArg == "function" ? thisArg : undefined;
                length -= customizer ? 1 : 0;
            }
            if (guard && isIterateeCall_1(sources[0], sources[1], guard)) {
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
    var createAssigner_1 = createAssigner;
    var assign = createAssigner_1(function(object, source, customizer) {
        return customizer ? assignWith_1(object, source, customizer) : baseAssign_1(object, source);
    });
    var assign_1 = assign;
    function createForIn(objectFunc) {
        return function(object, iteratee, thisArg) {
            if (typeof iteratee != "function" || thisArg !== undefined) {
                iteratee = bindCallback_1(iteratee, thisArg, 3);
            }
            return objectFunc(object, iteratee, keysIn_1);
        };
    }
    var createForIn_1 = createForIn;
    var forIn = createForIn_1(baseFor_1);
    var forIn_1 = forIn;
    function arrayMap(array, iteratee) {
        var index = -1, length = array.length, result = Array(length);
        while (++index < length) {
            result[index] = iteratee(array[index], index, array);
        }
        return result;
    }
    var arrayMap_1 = arrayMap;
    function indexOfNaN(array, fromIndex, fromRight) {
        var length = array.length, index = fromIndex + (fromRight ? 0 : -1);
        while (fromRight ? index-- : ++index < length) {
            var other = array[index];
            if (other !== other) {
                return index;
            }
        }
        return -1;
    }
    var indexOfNaN_1 = indexOfNaN;
    function baseIndexOf(array, value, fromIndex) {
        if (value !== value) {
            return indexOfNaN_1(array, fromIndex);
        }
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
    var baseIndexOf_1 = baseIndexOf;
    function cacheIndexOf(cache, value) {
        var data = cache.data, result = typeof value == "string" || isObject_1(value) ? data.set.has(value) : data.hash[value];
        return result ? 0 : -1;
    }
    var cacheIndexOf_1 = cacheIndexOf;
    function cachePush(value) {
        var data = this.data;
        if (typeof value == "string" || isObject_1(value)) {
            data.set.add(value);
        } else {
            data.hash[value] = true;
        }
    }
    var cachePush_1 = cachePush;
    var Set = getNative_1(commonjsGlobal, "Set");
    var nativeCreate = getNative_1(Object, "create");
    function SetCache(values) {
        var length = values ? values.length : 0;
        this.data = {
            "hash": nativeCreate(null),
            "set": new Set()
        };
        while (length--) {
            this.push(values[length]);
        }
    }
    SetCache.prototype.push = cachePush_1;
    var SetCache_1 = SetCache;
    var Set$1 = getNative_1(commonjsGlobal, "Set");
    var nativeCreate$1 = getNative_1(Object, "create");
    function createCache(values) {
        return nativeCreate$1 && Set$1 ? new SetCache_1(values) : null;
    }
    var createCache_1 = createCache;
    var LARGE_ARRAY_SIZE = 200;
    function baseDifference(array, values) {
        var length = array ? array.length : 0, result = [];
        if (!length) {
            return result;
        }
        var index = -1, indexOf = baseIndexOf_1, isCommon = true, cache = isCommon && values.length >= LARGE_ARRAY_SIZE ? createCache_1(values) : null, valuesLength = values.length;
        if (cache) {
            indexOf = cacheIndexOf_1;
            isCommon = false;
            values = cache;
        }
        outer: while (++index < length) {
            var value = array[index];
            if (isCommon && value === value) {
                var valuesIndex = valuesLength;
                while (valuesIndex--) {
                    if (values[valuesIndex] === value) {
                        continue outer;
                    }
                }
                result.push(value);
            } else if (indexOf(values, value, 0) < 0) {
                result.push(value);
            }
        }
        return result;
    }
    var baseDifference_1 = baseDifference;
    function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
            array[offset + index] = values[index];
        }
        return array;
    }
    var arrayPush_1 = arrayPush;
    function baseFlatten(array, isDeep, isStrict, result) {
        result || (result = []);
        var index = -1, length = array.length;
        while (++index < length) {
            var value = array[index];
            if (isObjectLike_1(value) && isArrayLike_1(value) && (isStrict || isArray_1(value) || isArguments_1(value))) {
                if (isDeep) {
                    baseFlatten(value, isDeep, isStrict, result);
                } else {
                    arrayPush_1(result, value);
                }
            } else if (!isStrict) {
                result[result.length] = value;
            }
        }
        return result;
    }
    var baseFlatten_1 = baseFlatten;
    function pickByArray(object, props) {
        object = toObject_1(object);
        var index = -1, length = props.length, result = {};
        while (++index < length) {
            var key = props[index];
            if (key in object) {
                result[key] = object[key];
            }
        }
        return result;
    }
    var pickByArray_1 = pickByArray;
    function baseForIn(object, iteratee) {
        return baseFor_1(object, iteratee, keysIn_1);
    }
    var baseForIn_1 = baseForIn;
    function pickByCallback(object, predicate) {
        var result = {};
        baseForIn_1(object, function(value, key, object) {
            if (predicate(value, key, object)) {
                result[key] = value;
            }
        });
        return result;
    }
    var pickByCallback_1 = pickByCallback;
    var omit = restParam_1(function(object, props) {
        if (object == null) {
            return {};
        }
        if (typeof props[0] != "function") {
            var props = arrayMap_1(baseFlatten_1(props), String);
            return pickByArray_1(object, baseDifference_1(keysIn_1(object), props));
        }
        var predicate = bindCallback_1(props[0], props[1], 3);
        return pickByCallback_1(object, function(value, key, object) {
            return !predicate(value, key, object);
        });
    });
    var omit_1 = omit;
    function noop$2() {}
    var noop_1 = noop$2;
    var lodash = {
        "forEach": forEach_1,
        "isNumber": isNumber_1,
        "isObject": isObject_1,
        "isString": isString_1,
        "isArray": isArray_1,
        "keys": keys_1,
        "assign": assign_1,
        "forIn": forIn_1,
        "omit": omit_1,
        "noop": noop_1
    };
    var window_1 = createCommonjsModule(function(module) {
        if (typeof window !== "undefined") {
            module.exports = window;
        } else if (typeof commonjsGlobal !== "undefined") {
            module.exports = commonjsGlobal;
        } else if (typeof self !== "undefined") {
            module.exports = self;
        } else {
            module.exports = {};
        }
    });
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
    var jsCookies = Cookies;
    function findDomains(domain) {
        var domainChunks = domain.split(".");
        var domains = [];
        for (var i = domainChunks.length - 1; i >= 0; i--) {
            domains.push(domainChunks.slice(i).join("."));
        }
        return domains;
    }
    var setCookie = function setCookie(storage, name, value) {
        var clone = lodash.assign({}, storage);
        var is = {
            "ip": storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
            "local": storage.domain === "localhost",
            "custom": storage.customDomain
        };
        var expires = new Date();
        expires.setSeconds(expires.getSeconds() + clone.expires);
        if (is.ip || is.local || is.custom) {
            clone.domain = is.local ? null : clone.domain;
            jsCookies.setItem(name, value, expires, clone.path, clone.domain);
        } else {
            var domains = findDomains(storage.domain);
            var ll = domains.length;
            var i = 0;
            if (!value) {
                for (;i < ll; i++) {
                    jsCookies.removeItem(name, storage.path, domains[i]);
                }
            } else {
                for (;i < ll; i++) {
                    clone.domain = domains[i];
                    jsCookies.setItem(name, value, expires, clone.path, clone.domain);
                    if (jsCookies.getItem(name) === value) {
                        storage.domain = clone.domain;
                        break;
                    }
                }
            }
        }
    };
    var json3 = createCommonjsModule(function(module, exports) {
        (function() {
            var isLoader = typeof undefined === "function";
            var objectTypes = {
                "function": true,
                "object": true
            };
            var freeExports = objectTypes["object"] && exports && !exports.nodeType && exports;
            var root = objectTypes[typeof window] && window || this, freeGlobal = freeExports && objectTypes["object"] && module && !module.nodeType && typeof commonjsGlobal == "object" && commonjsGlobal;
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
        }).call(commonjsGlobal);
    });
    var cc = String.fromCharCode;
    var m$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    function encode$1(n) {
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
            o = o + m$1.charAt(e1) + m$1.charAt(e2) + m$1.charAt(e3) + m$1.charAt(e4);
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
    var toBase64 = encode$1;
    var objectToBase64 = function objectToBase64(object) {
        return toBase64(json3.stringify(object));
    };
    var invariant$1 = misc.invariant;
    var noop$3 = misc.noop;
    var fetchWithTimeout$1 = misc.fetchWithTimeout;
    function validateRecord(table, record) {
        invariant$1(lodash.isString(table), "Must provide a table");
        invariant$1(/^[a-z0-9_]{3,255}$/.test(table), "Table must be between 3 and 255 characters and must " + "consist only of lower case letters, numbers, and _");
        invariant$1(lodash.isObject(record), "Must provide a record");
    }
    var BLOCKEVENTSCOOKIE = "__td_blockEvents";
    var SIGNEDMODECOOKIE = "__td_signed";
    var BLOCKEVENTSCOOKIE_1 = BLOCKEVENTSCOOKIE;
    var SIGNEDMODECOOKIE_1 = SIGNEDMODECOOKIE;
    var blockEvents = function blockEvents() {
        setCookie(this.client.storage, BLOCKEVENTSCOOKIE, "true");
    };
    var unblockEvents = function unblockEvents() {
        setCookie(this.client.storage, BLOCKEVENTSCOOKIE, "false");
    };
    var areEventsBlocked = function areEventsBlocked() {
        return jsCookies.getItem(BLOCKEVENTSCOOKIE) === "true";
    };
    var setSignedMode = function setSignedMode(signedMode) {
        if (this.client.storeConsentByLocalStorage) {
            window_1.localStorage.setItem(SIGNEDMODECOOKIE, "true");
        } else {
            setCookie(this.client.storage, SIGNEDMODECOOKIE, "true");
        }
        return this;
    };
    var setAnonymousMode = function setAnonymousMode(signedMode) {
        if (this.client.storeConsentByLocalStorage) {
            window_1.localStorage.setItem(SIGNEDMODECOOKIE, "false");
        } else {
            setCookie(this.client.storage, SIGNEDMODECOOKIE, "false");
        }
        return this;
    };
    var inSignedMode = function inSignedMode() {
        if (this.client.storeConsentByLocalStorage) {
            return window_1.localStorage.getItem([ SIGNEDMODECOOKIE ]) !== "false" && (window_1.localStorage.getItem([ SIGNEDMODECOOKIE ]) === "true" || this.client.startInSignedMode);
        }
        return jsCookies.getItem(SIGNEDMODECOOKIE) !== "false" && (jsCookies.getItem(SIGNEDMODECOOKIE) === "true" || this.client.startInSignedMode);
    };
    var _sendRecord = function _sendRecord(request, success, error) {
        success = success || noop$3;
        error = error || noop$3;
        if (this.areEventsBlocked()) {
            return;
        }
        invariant$1(request.type === "jsonp", "Request type " + request.type + " not supported");
        var params = [ "api_key=" + encodeURIComponent(request.apikey), "modified=" + encodeURIComponent(new Date().getTime()), "data=" + encodeURIComponent(objectToBase64(request.record)) ];
        if (request.time) {
            params.push("time=" + encodeURIComponent(request.time));
        }
        var url = request.url + "?" + params.join("&");
        var isClickedLink = request.record.tag === "a" && !!request.record.href;
        if (window.fetch && (this._windowBeingUnloaded || isClickedLink)) {
            fetchWithTimeout$1(url, this.client.jsonpTimeout, {
                "method": "POST",
                "keepalive": true
            }).then(function(response) {
                success(response);
            })["catch"](function(err) {
                error(err);
            });
        } else {
            jsonp_1(url, {
                "prefix": "TreasureJSONPCallback",
                "timeout": this.client.jsonpTimeout
            }, function(err, res) {
                return err ? error(err) : success(res);
            });
        }
    };
    var applyProperties = function applyProperties(table, payload) {
        return lodash.assign({}, this.get("$global"), this.get(table), payload);
    };
    var addRecord = function addRecord(table, record, success, error) {
        validateRecord(table, record);
        var propertiesRecord = this.applyProperties(table, record);
        var finalRecord = this.inSignedMode() ? propertiesRecord : lodash.omit(propertiesRecord, [ "td_ip", "td_client_id", "td_global_id" ]);
        var request = {
            "apikey": this.client.writeKey,
            "record": finalRecord,
            "time": null,
            "type": this.client.requestType,
            "url": this.client.endpoint + this.client.database + "/" + table
        };
        if (request.record.time) {
            request.time = request.record.time;
        }
        if (this.client.development) {
            this.log("addRecord", request);
        } else if (!this.areEventsBlocked()) {
            this._sendRecord(request, success, error);
        }
    };
    var _validateRecord = validateRecord;
    var record = {
        "BLOCKEVENTSCOOKIE": BLOCKEVENTSCOOKIE_1,
        "SIGNEDMODECOOKIE": SIGNEDMODECOOKIE_1,
        "blockEvents": blockEvents,
        "unblockEvents": unblockEvents,
        "areEventsBlocked": areEventsBlocked,
        "setSignedMode": setSignedMode,
        "setAnonymousMode": setAnonymousMode,
        "inSignedMode": inSignedMode,
        "_sendRecord": _sendRecord,
        "applyProperties": applyProperties,
        "addRecord": addRecord,
        "_validateRecord": _validateRecord
    };
    var config = {
        "GLOBAL": "Treasure",
        "VERSION": "2.2.0",
        "HOST": "in.treasuredata.com",
        "DATABASE": "",
        "PATHNAME": "/js/v3/event/"
    };
    var configurator = createCommonjsModule(function(module, exports) {
        var invariant = misc.invariant;
        function validateOptions(options) {
            invariant(lodash.isObject(options), "Check out our JavaScript SDK Usage Guide: " + "http://docs.treasuredata.com/articles/javascript-sdk");
            invariant(lodash.isString(options.writeKey), "Must provide a writeKey");
            invariant(lodash.isString(options.database), "Must provide a database");
            invariant(/^[a-z0-9_]{3,255}$/.test(options.database), "Database must be between 3 and 255 characters and must " + "consist only of lower case letters, numbers, and _");
        }
        var defaultSSCCookieDomain = function() {
            var domainChunks = document.location.hostname.split(".");
            for (var i = domainChunks.length - 2; i >= 1; i--) {
                var domain = domainChunks.slice(i).join(".");
                var name = "_td_domain_" + domain;
                jsCookies.setItem(name, domain, 3600, "/", domain);
                if (jsCookies.getItem(name) === domain) {
                    return domain;
                }
            }
            return document.location.hostname;
        };
        exports.DEFAULT_CONFIG = {
            "database": config.DATABASE,
            "development": false,
            "globalIdCookie": "_td_global",
            "host": config.HOST,
            "logging": true,
            "pathname": config.PATHNAME,
            "requestType": "jsonp",
            "jsonpTimeout": 1e4,
            "startInSignedMode": false,
            "useServerSideCookie": false,
            "sscDomain": defaultSSCCookieDomain,
            "sscServer": function(cookieDomain) {
                return [ "ssc", cookieDomain ].join(".");
            },
            "storeConsentByLocalStorage": false
        };
        exports.configure = function configure(options) {
            this.client = lodash.assign({
                "globals": {}
            }, exports.DEFAULT_CONFIG, options, {
                "requestType": "jsonp"
            });
            validateOptions(this.client);
            if (!this.client.endpoint) {
                this.client.endpoint = "https://" + this.client.host + this.client.pathname;
            }
            return this;
        };
        exports.set = function set(table, property, value) {
            if (lodash.isObject(table)) {
                property = table;
                table = "$global";
            }
            this.client.globals[table] = this.client.globals[table] || {};
            if (lodash.isObject(property)) {
                lodash.assign(this.client.globals[table], property);
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
    });
    var configurator_1 = configurator.DEFAULT_CONFIG;
    var configurator_2 = configurator.configure;
    var configurator_3 = configurator.set;
    var configurator_4 = configurator.get;
    var version = config.VERSION;
    var ready = createCommonjsModule(function(module) {
        !function(name, definition) {
            module.exports = definition();
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
    });
    var forEach$1 = lodash.forEach;
    var isString$1 = lodash.isString;
    var disposable$1 = misc.disposable;
    function getEventTarget(event) {
        var target = event.target || event.srcElement || window.document;
        return target.nodeType === 3 ? target.parentNode : target;
    }
    function addEventListener(el, type, fn) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
            return disposable$1(function() {
                el.removeEventListener(type, handler, false);
            });
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, handler);
            return disposable$1(function() {
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
        tag = el && el.tagName && el.tagName.toLowerCase()) {
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
        forEach$1([ "alt", "class", "href", "id", "name", "role", "title", "type" ], function(attrName) {
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
        if (className && isString$1(className)) {
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
    var element = {
        "addEventListener": addEventListener,
        "createTreeHasIgnoreAttribute": createTreeHasIgnoreAttribute,
        "getElementData": getElementData,
        "getEventTarget": getEventTarget,
        "hasAttribute": hasAttribute,
        "htmlElementAsString": htmlElementAsString,
        "htmlTreeAsString": htmlTreeAsString,
        "findElement": findElement
    };
    var assign$1 = lodash.assign;
    var disposable$2 = misc.disposable;
    function defaultExtendClickData(event, data) {
        return data;
    }
    function configu() {
        this._clickTrackingInstalled = false;
    }
    function trackClicks(trackClicksOptions) {
        if (this._clickTrackingInstalled) return;
        var instance = this;
        var options = assign$1({
            "element": window_1.document,
            "extendClickData": defaultExtendClickData,
            "ignoreAttribute": "td-ignore",
            "tableName": "clicks"
        }, trackClicksOptions);
        var treeHasIgnoreAttribute = element.createTreeHasIgnoreAttribute(options.ignoreAttribute);
        var removeClickTracker = element.addEventListener(options.element, "click", clickTracker);
        instance._clickTrackingInstalled = true;
        return disposable$2(function() {
            removeClickTracker();
            instance._clickTrackingInstalled = false;
        });
        function clickTracker(e) {
            var target = element.findElement(element.getEventTarget(e));
            if (target && !treeHasIgnoreAttribute(target)) {
                var elementData = element.getElementData(target);
                var data = options.extendClickData(e, elementData);
                if (data) {
                    instance.trackEvent(options.tableName, data);
                }
            }
        }
    }
    var clicks = {
        "configure": configu,
        "trackClicks": trackClicks
    };
    var invariant$2 = misc.invariant;
    var noop$4 = misc.noop;
    function cacheSuccess(result, cookieName) {
        jsCookies.setItem(cookieName, result["global_id"], 6e3);
        return result["global_id"];
    }
    function configu$1() {}
    function fetchGlobalID(success, error, forceFetch) {
        success = success || noop$4;
        error = error || noop$4;
        if (!this.inSignedMode()) {
            return error("not in signed in mode");
        }
        var cookieName = this.client.globalIdCookie;
        var cachedGlobalId = jsCookies.getItem(this.client.globalIdCookie);
        if (cachedGlobalId && !forceFetch) {
            return setTimeout(function() {
                success(cachedGlobalId);
            }, 0);
        }
        var url = "https://" + this.client.host + "/js/v3/global_id";
        invariant$2(this.client.requestType === "jsonp", "Request type " + this.client.requestType + " not supported");
        jsonp_1(url, {
            "prefix": "TreasureJSONPCallback",
            "timeout": this.client.jsonpTimeout
        }, function(err, res) {
            return err ? error(err) : success(cacheSuccess(res, cookieName));
        });
    }
    var globalid = {
        "cacheSuccess": cacheSuccess,
        "configure": configu$1,
        "fetchGlobalID": fetchGlobalID
    };
    var noop$5 = misc.noop;
    var invariant$3 = misc.invariant;
    function configure(config) {
        config = lodash.isObject(config) ? config : {};
        this.client.cdpHost = config.cdpHost || "cdp.in.treasuredata.com";
        return this;
    }
    function fetchUserSegments(tokenOrConfig, successCallback, errorCallback) {
        var isConfigObject = lodash.isObject(tokenOrConfig) && !lodash.isArray(tokenOrConfig);
        var audienceToken = isConfigObject ? tokenOrConfig.audienceToken : tokenOrConfig;
        var keys = isConfigObject && tokenOrConfig.keys || {};
        successCallback = successCallback || noop$5;
        errorCallback = errorCallback || noop$5;
        invariant$3(typeof audienceToken === "string" || lodash.isArray(audienceToken), 'audienceToken must be a string or array; received "' + audienceToken.toString() + '"');
        invariant$3(lodash.isObject(keys), 'keys must be an object; received "' + keys + '"');
        var token = lodash.isArray(audienceToken) ? audienceToken.join(",") : audienceToken;
        var keysName = lodash.keys(keys);
        var keysArray = [];
        lodash.forEach(keysName, function(key) {
            keysArray.push([ "key.", key, "=", keys[key] ].join(""));
        });
        var keyString = keysArray.join("&");
        var url = "https://" + this.client.cdpHost + "/cdp/lookup/collect/segments?version=2&token=" + token + (keyString && "&" + keyString);
        jsonp_1(url, {
            "prefix": "TreasureJSONPCallback",
            "timeout": this.client.jsonpTimeout
        }, function(err, res) {
            return err ? errorCallback(err) : successCallback(res);
        });
    }
    var personalization = {
        "configure": configure,
        "fetchUserSegments": fetchUserSegments
    };
    var generateUUID = function generateUUID() {
        var d = new Date().getTime();
        if (window_1.performance && typeof window_1.performance.now === "function") {
            d += window_1.performance.now();
        }
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : r & 3 | 8).toString(16);
        });
        return uuid;
    };
    var document$1 = window_1.document;
    function configureValues(track) {
        return lodash.assign({
            "td_version": function() {
                return version;
            },
            "td_client_id": function() {
                return track.uuid;
            },
            "td_charset": function() {
                return (document$1.characterSet || document$1.charset || "-").toLowerCase();
            },
            "td_language": function() {
                var nav = window_1.navigator;
                return (nav && (nav.language || nav.browserLanguage) || "-").toLowerCase();
            },
            "td_color": function() {
                return window_1.screen ? window_1.screen.colorDepth + "-bit" : "-";
            },
            "td_screen": function() {
                return window_1.screen ? window_1.screen.width + "x" + window_1.screen.height : "-";
            },
            "td_viewport": function() {
                var clientHeight = document$1.documentElement && document$1.documentElement.clientHeight;
                var clientWidth = document$1.documentElement && document$1.documentElement.clientWidth;
                var innerHeight = window_1.innerHeight;
                var innerWidth = window_1.innerWidth;
                var height = clientHeight < innerHeight ? innerHeight : clientHeight;
                var width = clientWidth < innerWidth ? innerWidth : clientWidth;
                return width + "x" + height;
            },
            "td_title": function() {
                return document$1.title;
            },
            "td_description": function() {
                return getMeta("description");
            },
            "td_url": function() {
                return !document$1.location || !document$1.location.href ? "" : document$1.location.href.split("#")[0];
            },
            "td_user_agent": function() {
                return window_1.navigator.userAgent;
            },
            "td_platform": function() {
                return window_1.navigator.platform;
            },
            "td_host": function() {
                return document$1.location.host;
            },
            "td_path": function() {
                return document$1.location.pathname;
            },
            "td_referrer": function() {
                return document$1.referrer;
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
        return lodash.assign({
            "pageviews": "pageviews",
            "events": "events",
            "values": {}
        }, track);
    }
    function configureStorage(storage) {
        if (storage === "none") {
            return false;
        }
        storage = lodash.isObject(storage) ? storage : {};
        return lodash.assign({
            "name": "_td",
            "expires": 63072e3,
            "domain": document$1.location.hostname,
            "customDomain": !!storage.domain,
            "path": "/"
        }, storage);
    }
    function getMeta(metaName) {
        var head = document$1.head || document$1.getElementsByTagName("head")[0];
        var metas = head.getElementsByTagName("meta");
        var metaLength = metas.length;
        for (var i = 0; i < metaLength; i++) {
            if (metas[i].getAttribute("name") === metaName) {
                return (metas[i].getAttribute("content") || "").substr(0, 8192);
            }
        }
        return "";
    }
    var configure$1 = function configure(config) {
        config = lodash.isObject(config) ? config : {};
        this.client.track = config.track = configureTrack(config.track);
        this.client.storage = config.storage = configureStorage(config.storage);
        console.log("in track:", this.client.storage);
        if (lodash.isNumber(config.clientId)) {
            config.clientId = config.clientId.toString();
        } else if (!config.clientId || !lodash.isString(config.clientId)) {
            if (config.storage && config.storage.name) {
                config.clientId = jsCookies.getItem(config.storage.name);
            }
            if (!config.clientId || config.clientId === "undefined") {
                config.clientId = generateUUID();
            }
        }
        this.resetUUID(config.storage, config.clientId);
        return this;
    };
    var resetUUID = function resetUUID(suggestedStorage, suggestedClientId) {
        var clientId = suggestedClientId || generateUUID();
        var storage = suggestedStorage || this.client.storage;
        this.client.track.uuid = clientId.replace(/\0/g, "");
        if (storage) {
            if (storage.expires) {
                setCookie(storage, storage.name, undefined);
                setCookie(storage, storage.name, this.client.track.uuid);
            }
        }
        this.client.track.values = lodash.assign(configureValues(this.client.track), this.client.track.values);
        return this;
    };
    var trackEvent = function trackEvent(table, record, success, failure) {
        if (!table) {
            table = this.client.track.events;
        }
        record = lodash.assign(this.getTrackValues(), record);
        this.addRecord(table, record, success, failure);
        return this;
    };
    var trackPageview = function trackPageview(table, success, failure) {
        if (!table) {
            table = this.client.track.pageviews;
        }
        this.trackEvent(table, {}, success, failure);
        return this;
    };
    var getTrackValues = function getTrackValues() {
        var result = {};
        lodash.forIn(this.client.track.values, function(value, key) {
            if (value) {
                result[key] = typeof value === "function" ? value() : value;
            }
        });
        return result;
    };
    var track = {
        "configure": configure$1,
        "resetUUID": resetUUID,
        "trackEvent": trackEvent,
        "trackPageview": trackPageview,
        "getTrackValues": getTrackValues
    };
    var noop$6 = misc.noop;
    var invariant$4 = misc.invariant;
    var cookieName = "_td_ssc_id";
    function configure$2() {
        return this;
    }
    function fetchServerCookie(success, error, forceFetch) {
        success = success || noop$6;
        error = error || noop$6;
        if (!this.inSignedMode()) {
            return error("not in signed in mode");
        }
        if (!this.client.useServerSideCookie) {
            return error("server side cookie not enabled");
        }
        if (!this._serverCookieDomainHost) {
            if (typeof this.client.sscDomain === "function") {
                this._serverCookieDomain = this.client.sscDomain();
            } else {
                this._serverCookieDomain = this.client.sscDomain;
            }
            if (typeof this.client.sscServer === "function") {
                this._serverCookieDomainHost = this.client.sscServer(this._serverCookieDomain);
            } else {
                this._serverCookieDomainHost = this.client.sscServer;
            }
        }
        var url = "https://" + this._serverCookieDomainHost + "/get_cookie_id?cookie_domain=" + window.encodeURI(this._serverCookieDomain) + "&r=" + new Date().getTime();
        var cachedSSCId = jsCookies.getItem(cookieName);
        if (cachedSSCId && !forceFetch) {
            return setTimeout(function() {
                success(cachedSSCId);
            }, 0);
        }
        invariant$4(this.client.requestType === "jsonp", "Request type " + this.client.requestType + " not supported");
        jsonp_1(url, {
            "prefix": "TreasureJSONPCallback",
            "timeout": this.client.jsonpTimeout
        }, function(err, res) {
            return err ? error(err) : success(res.td_ssc_id);
        });
    }
    var servercookie = {
        "configure": configure$2,
        "fetchServerCookie": fetchServerCookie
    };
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
                console.log("call:", plugin);
                Treasure.Plugins[plugin].configure.call(this, options);
            }
        }
        if (window.addEventListener) {
            var that = this;
            window.addEventListener("pagehide", function() {
                that._windowBeingUnloaded = true;
            });
        }
    };
    Treasure.version = Treasure.prototype.version = version;
    Treasure.prototype.log = function() {
        var args = [ "[" + config.GLOBAL + "]" ];
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
    Treasure.prototype.ready = ready;
    Treasure.prototype.applyProperties = record.applyProperties;
    Treasure.prototype.addRecord = record.addRecord;
    Treasure.prototype._sendRecord = record._sendRecord;
    Treasure.prototype.blockEvents = record.blockEvents;
    Treasure.prototype.unblockEvents = record.unblockEvents;
    Treasure.prototype.areEventsBlocked = record.areEventsBlocked;
    Treasure.prototype.setSignedMode = record.setSignedMode;
    Treasure.prototype.setAnonymousMode = record.setAnonymousMode;
    Treasure.prototype.inSignedMode = record.inSignedMode;
    Treasure.prototype.getCookie = jsCookies.getItem;
    Treasure.prototype._configurator = configurator;
    Treasure.Plugins = {
        "Clicks": clicks,
        "GlobalID": globalid,
        "Personalization": personalization,
        "Track": track,
        "ServerSideCookie": servercookie
    };
    lodash.forIn(Treasure.Plugins, function(plugin) {
        lodash.forIn(plugin, function(method, name) {
            if (!Treasure.prototype[name]) {
                Treasure.prototype[name] = method;
            }
        });
    });
    var treasure = Treasure;
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
    var TREASURE_KEYS = [ "init", "set", "blockEvents", "unblockEvents", "setSignedMode", "setAnonymousMode", "resetUUID", "addRecord", "fetchGlobalID", "trackPageview", "trackEvent", "trackClicks", "fetchUserSegments", "fetchServerCookie", "ready" ];
    var loadClients = function loadClients(Treasure, name) {
        if (lodash.isObject(window_1[name])) {
            var snippet = window_1[name];
            var clients = snippet.clients;
            lodash.forIn(Treasure.prototype, function(value, key) {
                snippet.prototype[key] = value;
            });
            lodash.forEach(clients, function(client) {
                lodash.forEach(TREASURE_KEYS, function(value) {
                    applyToClient(client, value);
                });
            });
        }
    };
    var GLOBAL = config.GLOBAL;
    loadClients(treasure, GLOBAL);
    window_1[GLOBAL] = treasure;
})();
