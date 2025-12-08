(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var lib = {};

	var record = {};

	var misc;
	var hasRequiredMisc;
	function requireMisc() {
	  if (hasRequiredMisc) return misc;
	  hasRequiredMisc = 1;
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
	  function _timeout(milliseconds, promise, timeoutMessage) {
	    var timerPromise = new Promise(function (resolve, reject) {
	      setTimeout(function () {
	        reject(new Error(timeoutMessage));
	      }, milliseconds);
	    });
	    return Promise.race([timerPromise, promise]);
	  }
	  function fetchWithTimeout(url, milliseconds, options) {
	    if (window.AbortController) {
	      var controller = new window.AbortController();
	      var promise = window.fetch(url, Object.assign({}, options, {
	        signal: controller.signal
	      }));
	      var timeoutId = setTimeout(function () {
	        controller.abort();
	      }, milliseconds);
	      return promise['finally'](function () {
	        clearTimeout(timeoutId);
	      });
	    } else {
	      return _timeout(milliseconds, window.fetch(url, options), 'Request Timeout');
	    }
	  }
	  function capitalizeFirstLetter(str) {
	    var firstCodeUnit = str[0];
	    if (firstCodeUnit < '\uD800' || firstCodeUnit > '\uDFFF') {
	      return str[0].toUpperCase() + str.slice(1);
	    }
	    return str.slice(0, 2).toUpperCase() + str.slice(2);
	  }
	  function isLocalStorageAccessible() {
	    var test = '__td__';
	    try {
	      localStorage.setItem(test, test);
	      localStorage.removeItem(test);
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }
	  function camelCase(str) {
	    if (!str) return;
	    return str.toLowerCase().split(' ').reduce((name, word, index) => {
	      if (index === 0) {
	        name += word;
	      } else {
	        name += capitalizeFirstLetter(word);
	      }
	      return name;
	    }, '');
	  }
	  var adlHeaders = {
	    'Content-Type': 'application/vnd.treasuredata.v1+json',
	    'Accept': 'application/vnd.treasuredata.v1+json'
	  };
	  var globalIdAdlHeaders = {
	    'Content-Type': 'application/vnd.treasuredata.v1.js+json',
	    'Accept': 'application/vnd.treasuredata.v1.js+json'
	  };
	  misc = {
	    disposable: disposable,
	    invariant: invariant,
	    fetchWithTimeout: fetchWithTimeout,
	    camelCase: camelCase,
	    isLocalStorageAccessible: isLocalStorageAccessible,
	    adlHeaders: adlHeaders,
	    globalIdAdlHeaders: globalIdAdlHeaders
	  };
	  return misc;
	}

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	var arrayEach_1;
	var hasRequiredArrayEach;
	function requireArrayEach() {
	  if (hasRequiredArrayEach) return arrayEach_1;
	  hasRequiredArrayEach = 1;
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
	  arrayEach_1 = arrayEach;
	  return arrayEach_1;
	}

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
	var isObject_1;
	var hasRequiredIsObject;
	function requireIsObject() {
	  if (hasRequiredIsObject) return isObject_1;
	  hasRequiredIsObject = 1;
	  function isObject(value) {
	    // Avoid a V8 JIT bug in Chrome 19-20.
	    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	    var type = typeof value;
	    return !!value && (type == 'object' || type == 'function');
	  }
	  isObject_1 = isObject;
	  return isObject_1;
	}

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	var isObjectLike_1;
	var hasRequiredIsObjectLike;
	function requireIsObjectLike() {
	  if (hasRequiredIsObjectLike) return isObjectLike_1;
	  hasRequiredIsObjectLike = 1;
	  function isObjectLike(value) {
	    return !!value && typeof value == 'object';
	  }
	  isObjectLike_1 = isObjectLike;
	  return isObjectLike_1;
	}

	var isString_1;
	var hasRequiredIsString;
	function requireIsString() {
	  if (hasRequiredIsString) return isString_1;
	  hasRequiredIsString = 1;
	  var isObjectLike = requireIsObjectLike();

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
	    return typeof value == 'string' || isObjectLike(value) && objToString.call(value) == stringTag;
	  }
	  isString_1 = isString;
	  return isString_1;
	}

	/** Used for native method references. */
	var support_1;
	var hasRequiredSupport;
	function requireSupport() {
	  if (hasRequiredSupport) return support_1;
	  hasRequiredSupport = 1;
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
	  (function (x) {
	    var Ctor = function () {
	        this.x = x;
	      },
	      object = {
	        '0': x,
	        'length': x
	      },
	      props = [];
	    Ctor.prototype = {
	      'valueOf': x,
	      'y': x
	    };
	    for (var key in new Ctor()) {
	      props.push(key);
	    }

	    /**
	     * Detect if `name` or `message` properties of `Error.prototype` are
	     * enumerable by default (IE < 9, Safari < 5.1).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

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
	    support.unindexedChars = 'x'[0] + Object('x')[0] != 'xx';
	  })(1);
	  support_1 = support;
	  return support_1;
	}

	var toObject_1;
	var hasRequiredToObject;
	function requireToObject() {
	  if (hasRequiredToObject) return toObject_1;
	  hasRequiredToObject = 1;
	  var isObject = requireIsObject(),
	    isString = requireIsString(),
	    support = requireSupport();

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
	  toObject_1 = toObject;
	  return toObject_1;
	}

	var createBaseFor_1;
	var hasRequiredCreateBaseFor;
	function requireCreateBaseFor() {
	  if (hasRequiredCreateBaseFor) return createBaseFor_1;
	  hasRequiredCreateBaseFor = 1;
	  var toObject = requireToObject();

	  /**
	   * Creates a base function for `_.forIn` or `_.forInRight`.
	   *
	   * @private
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {Function} Returns the new base function.
	   */
	  function createBaseFor(fromRight) {
	    return function (object, iteratee, keysFunc) {
	      var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;
	      while (fromRight ? index-- : ++index < length) {
	        var key = props[index];
	        if (iteratee(iterable[key], key, iterable) === false) {
	          break;
	        }
	      }
	      return object;
	    };
	  }
	  createBaseFor_1 = createBaseFor;
	  return createBaseFor_1;
	}

	var baseFor_1;
	var hasRequiredBaseFor;
	function requireBaseFor() {
	  if (hasRequiredBaseFor) return baseFor_1;
	  hasRequiredBaseFor = 1;
	  var createBaseFor = requireCreateBaseFor();

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
	  baseFor_1 = baseFor;
	  return baseFor_1;
	}

	var isFunction_1;
	var hasRequiredIsFunction;
	function requireIsFunction() {
	  if (hasRequiredIsFunction) return isFunction_1;
	  hasRequiredIsFunction = 1;
	  var isObject = requireIsObject();

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
	  isFunction_1 = isFunction;
	  return isFunction_1;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	var isHostObject_1;
	var hasRequiredIsHostObject;
	function requireIsHostObject() {
	  if (hasRequiredIsHostObject) return isHostObject_1;
	  hasRequiredIsHostObject = 1;
	  var isHostObject = function () {
	    try {
	      Object({
	        'toString': 0
	      } + '');
	    } catch (e) {
	      return function () {
	        return false;
	      };
	    }
	    return function (value) {
	      // IE < 9 presents many host objects as `Object` objects that can coerce
	      // to strings despite having improperly defined `toString` methods.
	      return typeof value.toString != 'function' && typeof (value + '') == 'string';
	    };
	  }();
	  isHostObject_1 = isHostObject;
	  return isHostObject_1;
	}

	var isNative_1;
	var hasRequiredIsNative;
	function requireIsNative() {
	  if (hasRequiredIsNative) return isNative_1;
	  hasRequiredIsNative = 1;
	  var isFunction = requireIsFunction(),
	    isHostObject = requireIsHostObject(),
	    isObjectLike = requireIsObjectLike();

	  /** Used to detect host constructors (Safari > 5). */
	  var reIsHostCtor = /^\[object .+?Constructor\]$/;

	  /** Used for native method references. */
	  var objectProto = Object.prototype;

	  /** Used to resolve the decompiled source of functions. */
	  var fnToString = Function.prototype.toString;

	  /** Used to check objects for own properties. */
	  var hasOwnProperty = objectProto.hasOwnProperty;

	  /** Used to detect if a method is native. */
	  var reIsNative = RegExp('^' + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

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
	  isNative_1 = isNative;
	  return isNative_1;
	}

	var getNative_1;
	var hasRequiredGetNative;
	function requireGetNative() {
	  if (hasRequiredGetNative) return getNative_1;
	  hasRequiredGetNative = 1;
	  var isNative = requireIsNative();

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
	  getNative_1 = getNative;
	  return getNative_1;
	}

	var baseProperty_1;
	var hasRequiredBaseProperty;
	function requireBaseProperty() {
	  if (hasRequiredBaseProperty) return baseProperty_1;
	  hasRequiredBaseProperty = 1;
	  var toObject = requireToObject();

	  /**
	   * The base implementation of `_.property` without support for deep paths.
	   *
	   * @private
	   * @param {string} key The key of the property to get.
	   * @returns {Function} Returns the new function.
	   */
	  function baseProperty(key) {
	    return function (object) {
	      return object == null ? undefined : toObject(object)[key];
	    };
	  }
	  baseProperty_1 = baseProperty;
	  return baseProperty_1;
	}

	var getLength_1;
	var hasRequiredGetLength;
	function requireGetLength() {
	  if (hasRequiredGetLength) return getLength_1;
	  hasRequiredGetLength = 1;
	  var baseProperty = requireBaseProperty();

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
	  getLength_1 = getLength;
	  return getLength_1;
	}

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var isLength_1;
	var hasRequiredIsLength;
	function requireIsLength() {
	  if (hasRequiredIsLength) return isLength_1;
	  hasRequiredIsLength = 1;
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
	  isLength_1 = isLength;
	  return isLength_1;
	}

	var isArrayLike_1;
	var hasRequiredIsArrayLike;
	function requireIsArrayLike() {
	  if (hasRequiredIsArrayLike) return isArrayLike_1;
	  hasRequiredIsArrayLike = 1;
	  var getLength = requireGetLength(),
	    isLength = requireIsLength();

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
	  isArrayLike_1 = isArrayLike;
	  return isArrayLike_1;
	}

	var isArguments_1;
	var hasRequiredIsArguments;
	function requireIsArguments() {
	  if (hasRequiredIsArguments) return isArguments_1;
	  hasRequiredIsArguments = 1;
	  var isArrayLike = requireIsArrayLike(),
	    isObjectLike = requireIsObjectLike();

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
	    return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	  }
	  isArguments_1 = isArguments;
	  return isArguments_1;
	}

	var isArray_1;
	var hasRequiredIsArray;
	function requireIsArray() {
	  if (hasRequiredIsArray) return isArray_1;
	  hasRequiredIsArray = 1;
	  var getNative = requireGetNative(),
	    isLength = requireIsLength(),
	    isObjectLike = requireIsObjectLike();

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
	  var isArray = nativeIsArray || function (value) {
	    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	  };
	  isArray_1 = isArray;
	  return isArray_1;
	}

	/** Used to detect unsigned integer values. */
	var isIndex_1;
	var hasRequiredIsIndex;
	function requireIsIndex() {
	  if (hasRequiredIsIndex) return isIndex_1;
	  hasRequiredIsIndex = 1;
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
	    value = typeof value == 'number' || reIsUint.test(value) ? +value : -1;
	    length = length == null ? MAX_SAFE_INTEGER : length;
	    return value > -1 && value % 1 == 0 && value < length;
	  }
	  isIndex_1 = isIndex;
	  return isIndex_1;
	}

	var keysIn_1;
	var hasRequiredKeysIn;
	function requireKeysIn() {
	  if (hasRequiredKeysIn) return keysIn_1;
	  hasRequiredKeysIn = 1;
	  var arrayEach = requireArrayEach(),
	    isArguments = requireIsArguments(),
	    isArray = requireIsArray(),
	    isFunction = requireIsFunction(),
	    isIndex = requireIsIndex(),
	    isLength = requireIsLength(),
	    isObject = requireIsObject(),
	    isString = requireIsString(),
	    support = requireSupport();

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
	  var shadowProps = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

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
	  nonEnumProps[arrayTag] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = {
	    'constructor': true,
	    'toLocaleString': true,
	    'toString': true,
	    'valueOf': true
	  };
	  nonEnumProps[boolTag] = nonEnumProps[stringTag] = {
	    'constructor': true,
	    'toString': true,
	    'valueOf': true
	  };
	  nonEnumProps[errorTag] = nonEnumProps[funcTag] = nonEnumProps[regexpTag] = {
	    'constructor': true,
	    'toString': true
	  };
	  nonEnumProps[objectTag] = {
	    'constructor': true
	  };
	  arrayEach(shadowProps, function (key) {
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
	    length = length && isLength(length) && (isArray(object) || isArguments(object) || isString(object)) && length || 0;
	    var Ctor = object.constructor,
	      index = -1,
	      proto = isFunction(Ctor) && Ctor.prototype || objectProto,
	      isProto = proto === object,
	      result = Array(length),
	      skipIndexes = length > 0,
	      skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error),
	      skipProto = support.enumPrototypes && isFunction(object);
	    while (++index < length) {
	      result[index] = index + '';
	    }
	    // lodash skips the `constructor` property when it infers it's iterating
	    // over a `prototype` object because IE < 9 can't set the `[[Enumerable]]`
	    // attribute of an existing property and the `constructor` property of a
	    // prototype defaults to non-enumerable.
	    for (var key in object) {
	      if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name')) && !(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	        result.push(key);
	      }
	    }
	    if (support.nonEnumShadows && object !== objectProto) {
	      var tag = object === stringProto ? stringTag : object === errorProto ? errorTag : objToString.call(object),
	        nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];
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
	  keysIn_1 = keysIn;
	  return keysIn_1;
	}

	var shimKeys_1;
	var hasRequiredShimKeys;
	function requireShimKeys() {
	  if (hasRequiredShimKeys) return shimKeys_1;
	  hasRequiredShimKeys = 1;
	  var isArguments = requireIsArguments(),
	    isArray = requireIsArray(),
	    isIndex = requireIsIndex(),
	    isLength = requireIsLength(),
	    isString = requireIsString(),
	    keysIn = requireKeysIn();

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
	    var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object) || isString(object));
	    var index = -1,
	      result = [];
	    while (++index < propsLength) {
	      var key = props[index];
	      if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
	        result.push(key);
	      }
	    }
	    return result;
	  }
	  shimKeys_1 = shimKeys;
	  return shimKeys_1;
	}

	var keys_1;
	var hasRequiredKeys;
	function requireKeys() {
	  if (hasRequiredKeys) return keys_1;
	  hasRequiredKeys = 1;
	  var getNative = requireGetNative(),
	    isArrayLike = requireIsArrayLike(),
	    isObject = requireIsObject(),
	    shimKeys = requireShimKeys(),
	    support = requireSupport();

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
	  var keys = !nativeKeys ? shimKeys : function (object) {
	    var Ctor = object == null ? undefined : object.constructor;
	    if (typeof Ctor == 'function' && Ctor.prototype === object || (typeof object == 'function' ? support.enumPrototypes : isArrayLike(object))) {
	      return shimKeys(object);
	    }
	    return isObject(object) ? nativeKeys(object) : [];
	  };
	  keys_1 = keys;
	  return keys_1;
	}

	var baseForOwn_1;
	var hasRequiredBaseForOwn;
	function requireBaseForOwn() {
	  if (hasRequiredBaseForOwn) return baseForOwn_1;
	  hasRequiredBaseForOwn = 1;
	  var baseFor = requireBaseFor(),
	    keys = requireKeys();

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
	  baseForOwn_1 = baseForOwn;
	  return baseForOwn_1;
	}

	var createBaseEach_1;
	var hasRequiredCreateBaseEach;
	function requireCreateBaseEach() {
	  if (hasRequiredCreateBaseEach) return createBaseEach_1;
	  hasRequiredCreateBaseEach = 1;
	  var getLength = requireGetLength(),
	    isLength = requireIsLength(),
	    toObject = requireToObject();

	  /**
	   * Creates a `baseEach` or `baseEachRight` function.
	   *
	   * @private
	   * @param {Function} eachFunc The function to iterate over a collection.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {Function} Returns the new base function.
	   */
	  function createBaseEach(eachFunc, fromRight) {
	    return function (collection, iteratee) {
	      var length = collection ? getLength(collection) : 0;
	      if (!isLength(length)) {
	        return eachFunc(collection, iteratee);
	      }
	      var index = fromRight ? length : -1,
	        iterable = toObject(collection);
	      while (fromRight ? index-- : ++index < length) {
	        if (iteratee(iterable[index], index, iterable) === false) {
	          break;
	        }
	      }
	      return collection;
	    };
	  }
	  createBaseEach_1 = createBaseEach;
	  return createBaseEach_1;
	}

	var baseEach_1;
	var hasRequiredBaseEach;
	function requireBaseEach() {
	  if (hasRequiredBaseEach) return baseEach_1;
	  hasRequiredBaseEach = 1;
	  var baseForOwn = requireBaseForOwn(),
	    createBaseEach = requireCreateBaseEach();

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
	  baseEach_1 = baseEach;
	  return baseEach_1;
	}

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
	var identity_1;
	var hasRequiredIdentity;
	function requireIdentity() {
	  if (hasRequiredIdentity) return identity_1;
	  hasRequiredIdentity = 1;
	  function identity(value) {
	    return value;
	  }
	  identity_1 = identity;
	  return identity_1;
	}

	var bindCallback_1;
	var hasRequiredBindCallback;
	function requireBindCallback() {
	  if (hasRequiredBindCallback) return bindCallback_1;
	  hasRequiredBindCallback = 1;
	  var identity = requireIdentity();

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
	      case 1:
	        return function (value) {
	          return func.call(thisArg, value);
	        };
	      case 3:
	        return function (value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	      case 4:
	        return function (accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	      case 5:
	        return function (value, other, key, object, source) {
	          return func.call(thisArg, value, other, key, object, source);
	        };
	    }
	    return function () {
	      return func.apply(thisArg, arguments);
	    };
	  }
	  bindCallback_1 = bindCallback;
	  return bindCallback_1;
	}

	var createForEach_1;
	var hasRequiredCreateForEach;
	function requireCreateForEach() {
	  if (hasRequiredCreateForEach) return createForEach_1;
	  hasRequiredCreateForEach = 1;
	  var bindCallback = requireBindCallback(),
	    isArray = requireIsArray();

	  /**
	   * Creates a function for `_.forEach` or `_.forEachRight`.
	   *
	   * @private
	   * @param {Function} arrayFunc The function to iterate over an array.
	   * @param {Function} eachFunc The function to iterate over a collection.
	   * @returns {Function} Returns the new each function.
	   */
	  function createForEach(arrayFunc, eachFunc) {
	    return function (collection, iteratee, thisArg) {
	      return typeof iteratee == 'function' && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee) : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	    };
	  }
	  createForEach_1 = createForEach;
	  return createForEach_1;
	}

	var forEach_1;
	var hasRequiredForEach;
	function requireForEach() {
	  if (hasRequiredForEach) return forEach_1;
	  hasRequiredForEach = 1;
	  var arrayEach = requireArrayEach(),
	    baseEach = requireBaseEach(),
	    createForEach = requireCreateForEach();

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
	  forEach_1 = forEach;
	  return forEach_1;
	}

	var isNumber_1;
	var hasRequiredIsNumber;
	function requireIsNumber() {
	  if (hasRequiredIsNumber) return isNumber_1;
	  hasRequiredIsNumber = 1;
	  var isObjectLike = requireIsObjectLike();

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
	    return typeof value == 'number' || isObjectLike(value) && objToString.call(value) == numberTag;
	  }
	  isNumber_1 = isNumber;
	  return isNumber_1;
	}

	var isEmpty_1;
	var hasRequiredIsEmpty;
	function requireIsEmpty() {
	  if (hasRequiredIsEmpty) return isEmpty_1;
	  hasRequiredIsEmpty = 1;
	  var isArguments = requireIsArguments(),
	    isArray = requireIsArray(),
	    isArrayLike = requireIsArrayLike(),
	    isFunction = requireIsFunction(),
	    isObjectLike = requireIsObjectLike(),
	    isString = requireIsString(),
	    keys = requireKeys();

	  /**
	   * Checks if `value` is empty. A value is considered empty unless it's an
	   * `arguments` object, array, string, or jQuery-like collection with a length
	   * greater than `0` or an object with own enumerable properties.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {Array|Object|string} value The value to inspect.
	   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	   * @example
	   *
	   * _.isEmpty(null);
	   * // => true
	   *
	   * _.isEmpty(true);
	   * // => true
	   *
	   * _.isEmpty(1);
	   * // => true
	   *
	   * _.isEmpty([1, 2, 3]);
	   * // => false
	   *
	   * _.isEmpty({ 'a': 1 });
	   * // => false
	   */
	  function isEmpty(value) {
	    if (value == null) {
	      return true;
	    }
	    if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice))) {
	      return !value.length;
	    }
	    return !keys(value).length;
	  }
	  isEmpty_1 = isEmpty;
	  return isEmpty_1;
	}

	var assignWith_1;
	var hasRequiredAssignWith;
	function requireAssignWith() {
	  if (hasRequiredAssignWith) return assignWith_1;
	  hasRequiredAssignWith = 1;
	  var keys = requireKeys();

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
	      if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
	        object[key] = result;
	      }
	    }
	    return object;
	  }
	  assignWith_1 = assignWith;
	  return assignWith_1;
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	var baseCopy_1;
	var hasRequiredBaseCopy;
	function requireBaseCopy() {
	  if (hasRequiredBaseCopy) return baseCopy_1;
	  hasRequiredBaseCopy = 1;
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
	  baseCopy_1 = baseCopy;
	  return baseCopy_1;
	}

	var baseAssign_1;
	var hasRequiredBaseAssign;
	function requireBaseAssign() {
	  if (hasRequiredBaseAssign) return baseAssign_1;
	  hasRequiredBaseAssign = 1;
	  var baseCopy = requireBaseCopy(),
	    keys = requireKeys();

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
	    return source == null ? object : baseCopy(source, keys(source), object);
	  }
	  baseAssign_1 = baseAssign;
	  return baseAssign_1;
	}

	var isIterateeCall_1;
	var hasRequiredIsIterateeCall;
	function requireIsIterateeCall() {
	  if (hasRequiredIsIterateeCall) return isIterateeCall_1;
	  hasRequiredIsIterateeCall = 1;
	  var isArrayLike = requireIsArrayLike(),
	    isIndex = requireIsIndex(),
	    isObject = requireIsObject();

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
	    if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
	      var other = object[index];
	      return value === value ? value === other : other !== other;
	    }
	    return false;
	  }
	  isIterateeCall_1 = isIterateeCall;
	  return isIterateeCall_1;
	}

	/** Used as the `TypeError` message for "Functions" methods. */
	var restParam_1;
	var hasRequiredRestParam;
	function requireRestParam() {
	  if (hasRequiredRestParam) return restParam_1;
	  hasRequiredRestParam = 1;
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
	    start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0);
	    return function () {
	      var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);
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
	  restParam_1 = restParam;
	  return restParam_1;
	}

	var createAssigner_1;
	var hasRequiredCreateAssigner;
	function requireCreateAssigner() {
	  if (hasRequiredCreateAssigner) return createAssigner_1;
	  hasRequiredCreateAssigner = 1;
	  var bindCallback = requireBindCallback(),
	    isIterateeCall = requireIsIterateeCall(),
	    restParam = requireRestParam();

	  /**
	   * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	   *
	   * @private
	   * @param {Function} assigner The function to assign values.
	   * @returns {Function} Returns the new assigner function.
	   */
	  function createAssigner(assigner) {
	    return restParam(function (object, sources) {
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
	  createAssigner_1 = createAssigner;
	  return createAssigner_1;
	}

	var assign_1;
	var hasRequiredAssign;
	function requireAssign() {
	  if (hasRequiredAssign) return assign_1;
	  hasRequiredAssign = 1;
	  var assignWith = requireAssignWith(),
	    baseAssign = requireBaseAssign(),
	    createAssigner = requireCreateAssigner();

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
	  var assign = createAssigner(function (object, source, customizer) {
	    return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
	  });
	  assign_1 = assign;
	  return assign_1;
	}

	var createForIn_1;
	var hasRequiredCreateForIn;
	function requireCreateForIn() {
	  if (hasRequiredCreateForIn) return createForIn_1;
	  hasRequiredCreateForIn = 1;
	  var bindCallback = requireBindCallback(),
	    keysIn = requireKeysIn();

	  /**
	   * Creates a function for `_.forIn` or `_.forInRight`.
	   *
	   * @private
	   * @param {Function} objectFunc The function to iterate over an object.
	   * @returns {Function} Returns the new each function.
	   */
	  function createForIn(objectFunc) {
	    return function (object, iteratee, thisArg) {
	      if (typeof iteratee != 'function' || thisArg !== undefined) {
	        iteratee = bindCallback(iteratee, thisArg, 3);
	      }
	      return objectFunc(object, iteratee, keysIn);
	    };
	  }
	  createForIn_1 = createForIn;
	  return createForIn_1;
	}

	var forIn_1;
	var hasRequiredForIn;
	function requireForIn() {
	  if (hasRequiredForIn) return forIn_1;
	  hasRequiredForIn = 1;
	  var baseFor = requireBaseFor(),
	    createForIn = requireCreateForIn();

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
	  forIn_1 = forIn;
	  return forIn_1;
	}

	/**
	 * A specialized version of `_.map` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	var arrayMap_1;
	var hasRequiredArrayMap;
	function requireArrayMap() {
	  if (hasRequiredArrayMap) return arrayMap_1;
	  hasRequiredArrayMap = 1;
	  function arrayMap(array, iteratee) {
	    var index = -1,
	      length = array.length,
	      result = Array(length);
	    while (++index < length) {
	      result[index] = iteratee(array[index], index, array);
	    }
	    return result;
	  }
	  arrayMap_1 = arrayMap;
	  return arrayMap_1;
	}

	/**
	 * Gets the index at which the first occurrence of `NaN` is found in `array`.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	 */
	var indexOfNaN_1;
	var hasRequiredIndexOfNaN;
	function requireIndexOfNaN() {
	  if (hasRequiredIndexOfNaN) return indexOfNaN_1;
	  hasRequiredIndexOfNaN = 1;
	  function indexOfNaN(array, fromIndex, fromRight) {
	    var length = array.length,
	      index = fromIndex + (fromRight ? 0 : -1);
	    while (fromRight ? index-- : ++index < length) {
	      var other = array[index];
	      if (other !== other) {
	        return index;
	      }
	    }
	    return -1;
	  }
	  indexOfNaN_1 = indexOfNaN;
	  return indexOfNaN_1;
	}

	var baseIndexOf_1;
	var hasRequiredBaseIndexOf;
	function requireBaseIndexOf() {
	  if (hasRequiredBaseIndexOf) return baseIndexOf_1;
	  hasRequiredBaseIndexOf = 1;
	  var indexOfNaN = requireIndexOfNaN();

	  /**
	   * The base implementation of `_.indexOf` without support for binary searches.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    if (value !== value) {
	      return indexOfNaN(array, fromIndex);
	    }
	    var index = fromIndex - 1,
	      length = array.length;
	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }
	  baseIndexOf_1 = baseIndexOf;
	  return baseIndexOf_1;
	}

	var cacheIndexOf_1;
	var hasRequiredCacheIndexOf;
	function requireCacheIndexOf() {
	  if (hasRequiredCacheIndexOf) return cacheIndexOf_1;
	  hasRequiredCacheIndexOf = 1;
	  var isObject = requireIsObject();

	  /**
	   * Checks if `value` is in `cache` mimicking the return signature of
	   * `_.indexOf` by returning `0` if the value is found, else `-1`.
	   *
	   * @private
	   * @param {Object} cache The cache to search.
	   * @param {*} value The value to search for.
	   * @returns {number} Returns `0` if `value` is found, else `-1`.
	   */
	  function cacheIndexOf(cache, value) {
	    var data = cache.data,
	      result = typeof value == 'string' || isObject(value) ? data.set.has(value) : data.hash[value];
	    return result ? 0 : -1;
	  }
	  cacheIndexOf_1 = cacheIndexOf;
	  return cacheIndexOf_1;
	}

	var cachePush_1;
	var hasRequiredCachePush;
	function requireCachePush() {
	  if (hasRequiredCachePush) return cachePush_1;
	  hasRequiredCachePush = 1;
	  var isObject = requireIsObject();

	  /**
	   * Adds `value` to the cache.
	   *
	   * @private
	   * @name push
	   * @memberOf SetCache
	   * @param {*} value The value to cache.
	   */
	  function cachePush(value) {
	    var data = this.data;
	    if (typeof value == 'string' || isObject(value)) {
	      data.set.add(value);
	    } else {
	      data.hash[value] = true;
	    }
	  }
	  cachePush_1 = cachePush;
	  return cachePush_1;
	}

	var SetCache_1;
	var hasRequiredSetCache;
	function requireSetCache() {
	  if (hasRequiredSetCache) return SetCache_1;
	  hasRequiredSetCache = 1;
	  var cachePush = requireCachePush(),
	    getNative = requireGetNative();

	  /** Native method references. */
	  var Set = getNative(commonjsGlobal, 'Set');

	  /* Native method references for those with the same name as other `lodash` methods. */
	  var nativeCreate = getNative(Object, 'create');

	  /**
	   *
	   * Creates a cache object to store unique values.
	   *
	   * @private
	   * @param {Array} [values] The values to cache.
	   */
	  function SetCache(values) {
	    var length = values ? values.length : 0;
	    this.data = {
	      'hash': nativeCreate(null),
	      'set': new Set()
	    };
	    while (length--) {
	      this.push(values[length]);
	    }
	  }

	  // Add functions to the `Set` cache.
	  SetCache.prototype.push = cachePush;
	  SetCache_1 = SetCache;
	  return SetCache_1;
	}

	var createCache_1;
	var hasRequiredCreateCache;
	function requireCreateCache() {
	  if (hasRequiredCreateCache) return createCache_1;
	  hasRequiredCreateCache = 1;
	  var SetCache = requireSetCache(),
	    getNative = requireGetNative();

	  /** Native method references. */
	  var Set = getNative(commonjsGlobal, 'Set');

	  /* Native method references for those with the same name as other `lodash` methods. */
	  var nativeCreate = getNative(Object, 'create');

	  /**
	   * Creates a `Set` cache object to optimize linear searches of large arrays.
	   *
	   * @private
	   * @param {Array} [values] The values to cache.
	   * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
	   */
	  function createCache(values) {
	    return nativeCreate && Set ? new SetCache(values) : null;
	  }
	  createCache_1 = createCache;
	  return createCache_1;
	}

	var baseDifference_1;
	var hasRequiredBaseDifference;
	function requireBaseDifference() {
	  if (hasRequiredBaseDifference) return baseDifference_1;
	  hasRequiredBaseDifference = 1;
	  var baseIndexOf = requireBaseIndexOf(),
	    cacheIndexOf = requireCacheIndexOf(),
	    createCache = requireCreateCache();

	  /** Used as the size to enable large array optimizations. */
	  var LARGE_ARRAY_SIZE = 200;

	  /**
	   * The base implementation of `_.difference` which accepts a single array
	   * of values to exclude.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {Array} values The values to exclude.
	   * @returns {Array} Returns the new array of filtered values.
	   */
	  function baseDifference(array, values) {
	    var length = array ? array.length : 0,
	      result = [];
	    if (!length) {
	      return result;
	    }
	    var index = -1,
	      indexOf = baseIndexOf,
	      isCommon = true,
	      cache = isCommon && values.length >= LARGE_ARRAY_SIZE ? createCache(values) : null,
	      valuesLength = values.length;
	    if (cache) {
	      indexOf = cacheIndexOf;
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
	  baseDifference_1 = baseDifference;
	  return baseDifference_1;
	}

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	var arrayPush_1;
	var hasRequiredArrayPush;
	function requireArrayPush() {
	  if (hasRequiredArrayPush) return arrayPush_1;
	  hasRequiredArrayPush = 1;
	  function arrayPush(array, values) {
	    var index = -1,
	      length = values.length,
	      offset = array.length;
	    while (++index < length) {
	      array[offset + index] = values[index];
	    }
	    return array;
	  }
	  arrayPush_1 = arrayPush;
	  return arrayPush_1;
	}

	var baseFlatten_1;
	var hasRequiredBaseFlatten;
	function requireBaseFlatten() {
	  if (hasRequiredBaseFlatten) return baseFlatten_1;
	  hasRequiredBaseFlatten = 1;
	  var arrayPush = requireArrayPush(),
	    isArguments = requireIsArguments(),
	    isArray = requireIsArray(),
	    isArrayLike = requireIsArrayLike(),
	    isObjectLike = requireIsObjectLike();

	  /**
	   * The base implementation of `_.flatten` with added support for restricting
	   * flattening and specifying the start index.
	   *
	   * @private
	   * @param {Array} array The array to flatten.
	   * @param {boolean} [isDeep] Specify a deep flatten.
	   * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	   * @param {Array} [result=[]] The initial result value.
	   * @returns {Array} Returns the new flattened array.
	   */
	  function baseFlatten(array, isDeep, isStrict, result) {
	    result || (result = []);
	    var index = -1,
	      length = array.length;
	    while (++index < length) {
	      var value = array[index];
	      if (isObjectLike(value) && isArrayLike(value) && (isStrict || isArray(value) || isArguments(value))) {
	        if (isDeep) {
	          // Recursively flatten arrays (susceptible to call stack limits).
	          baseFlatten(value, isDeep, isStrict, result);
	        } else {
	          arrayPush(result, value);
	        }
	      } else if (!isStrict) {
	        result[result.length] = value;
	      }
	    }
	    return result;
	  }
	  baseFlatten_1 = baseFlatten;
	  return baseFlatten_1;
	}

	var pickByArray_1;
	var hasRequiredPickByArray;
	function requirePickByArray() {
	  if (hasRequiredPickByArray) return pickByArray_1;
	  hasRequiredPickByArray = 1;
	  var toObject = requireToObject();

	  /**
	   * A specialized version of `_.pick` which picks `object` properties specified
	   * by `props`.
	   *
	   * @private
	   * @param {Object} object The source object.
	   * @param {string[]} props The property names to pick.
	   * @returns {Object} Returns the new object.
	   */
	  function pickByArray(object, props) {
	    object = toObject(object);
	    var index = -1,
	      length = props.length,
	      result = {};
	    while (++index < length) {
	      var key = props[index];
	      if (key in object) {
	        result[key] = object[key];
	      }
	    }
	    return result;
	  }
	  pickByArray_1 = pickByArray;
	  return pickByArray_1;
	}

	var baseForIn_1;
	var hasRequiredBaseForIn;
	function requireBaseForIn() {
	  if (hasRequiredBaseForIn) return baseForIn_1;
	  hasRequiredBaseForIn = 1;
	  var baseFor = requireBaseFor(),
	    keysIn = requireKeysIn();

	  /**
	   * The base implementation of `_.forIn` without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Object} object The object to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Object} Returns `object`.
	   */
	  function baseForIn(object, iteratee) {
	    return baseFor(object, iteratee, keysIn);
	  }
	  baseForIn_1 = baseForIn;
	  return baseForIn_1;
	}

	var pickByCallback_1;
	var hasRequiredPickByCallback;
	function requirePickByCallback() {
	  if (hasRequiredPickByCallback) return pickByCallback_1;
	  hasRequiredPickByCallback = 1;
	  var baseForIn = requireBaseForIn();

	  /**
	   * A specialized version of `_.pick` which picks `object` properties `predicate`
	   * returns truthy for.
	   *
	   * @private
	   * @param {Object} object The source object.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {Object} Returns the new object.
	   */
	  function pickByCallback(object, predicate) {
	    var result = {};
	    baseForIn(object, function (value, key, object) {
	      if (predicate(value, key, object)) {
	        result[key] = value;
	      }
	    });
	    return result;
	  }
	  pickByCallback_1 = pickByCallback;
	  return pickByCallback_1;
	}

	var omit_1;
	var hasRequiredOmit;
	function requireOmit() {
	  if (hasRequiredOmit) return omit_1;
	  hasRequiredOmit = 1;
	  var arrayMap = requireArrayMap(),
	    baseDifference = requireBaseDifference(),
	    baseFlatten = requireBaseFlatten(),
	    bindCallback = requireBindCallback(),
	    keysIn = requireKeysIn(),
	    pickByArray = requirePickByArray(),
	    pickByCallback = requirePickByCallback(),
	    restParam = requireRestParam();

	  /**
	   * The opposite of `_.pick`; this method creates an object composed of the
	   * own and inherited enumerable properties of `object` that are not omitted.
	   *
	   * @static
	   * @memberOf _
	   * @category Object
	   * @param {Object} object The source object.
	   * @param {Function|...(string|string[])} [predicate] The function invoked per
	   *  iteration or property names to omit, specified as individual property
	   *  names or arrays of property names.
	   * @param {*} [thisArg] The `this` binding of `predicate`.
	   * @returns {Object} Returns the new object.
	   * @example
	   *
	   * var object = { 'user': 'fred', 'age': 40 };
	   *
	   * _.omit(object, 'age');
	   * // => { 'user': 'fred' }
	   *
	   * _.omit(object, _.isNumber);
	   * // => { 'user': 'fred' }
	   */
	  var omit = restParam(function (object, props) {
	    if (object == null) {
	      return {};
	    }
	    if (typeof props[0] != 'function') {
	      var props = arrayMap(baseFlatten(props), String);
	      return pickByArray(object, baseDifference(keysIn(object), props));
	    }
	    var predicate = bindCallback(props[0], props[1], 3);
	    return pickByCallback(object, function (value, key, object) {
	      return !predicate(value, key, object);
	    });
	  });
	  omit_1 = omit;
	  return omit_1;
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	var arrayCopy_1;
	var hasRequiredArrayCopy;
	function requireArrayCopy() {
	  if (hasRequiredArrayCopy) return arrayCopy_1;
	  hasRequiredArrayCopy = 1;
	  function arrayCopy(source, array) {
	    var index = -1,
	      length = source.length;
	    array || (array = Array(length));
	    while (++index < length) {
	      array[index] = source[index];
	    }
	    return array;
	  }
	  arrayCopy_1 = arrayCopy;
	  return arrayCopy_1;
	}

	/** Used for native method references. */
	var initCloneArray_1;
	var hasRequiredInitCloneArray;
	function requireInitCloneArray() {
	  if (hasRequiredInitCloneArray) return initCloneArray_1;
	  hasRequiredInitCloneArray = 1;
	  var objectProto = Object.prototype;

	  /** Used to check objects for own properties. */
	  var hasOwnProperty = objectProto.hasOwnProperty;

	  /**
	   * Initializes an array clone.
	   *
	   * @private
	   * @param {Array} array The array to clone.
	   * @returns {Array} Returns the initialized clone.
	   */
	  function initCloneArray(array) {
	    var length = array.length,
	      result = new array.constructor(length);

	    // Add array properties assigned by `RegExp#exec`.
	    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	      result.index = array.index;
	      result.input = array.input;
	    }
	    return result;
	  }
	  initCloneArray_1 = initCloneArray;
	  return initCloneArray_1;
	}

	/** Native method references. */
	var bufferClone_1;
	var hasRequiredBufferClone;
	function requireBufferClone() {
	  if (hasRequiredBufferClone) return bufferClone_1;
	  hasRequiredBufferClone = 1;
	  var ArrayBuffer = commonjsGlobal.ArrayBuffer,
	    Uint8Array = commonjsGlobal.Uint8Array;

	  /**
	   * Creates a clone of the given array buffer.
	   *
	   * @private
	   * @param {ArrayBuffer} buffer The array buffer to clone.
	   * @returns {ArrayBuffer} Returns the cloned array buffer.
	   */
	  function bufferClone(buffer) {
	    var result = new ArrayBuffer(buffer.byteLength),
	      view = new Uint8Array(result);
	    view.set(new Uint8Array(buffer));
	    return result;
	  }
	  bufferClone_1 = bufferClone;
	  return bufferClone_1;
	}

	var initCloneByTag_1;
	var hasRequiredInitCloneByTag;
	function requireInitCloneByTag() {
	  if (hasRequiredInitCloneByTag) return initCloneByTag_1;
	  hasRequiredInitCloneByTag = 1;
	  var bufferClone = requireBufferClone();

	  /** `Object#toString` result references. */
	  var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	  var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	  /** Used to match `RegExp` flags from their coerced string values. */
	  var reFlags = /\w*$/;

	  /** Native method references. */
	  var Uint8Array = commonjsGlobal.Uint8Array;

	  /** Used to lookup a type array constructors by `toStringTag`. */
	  var ctorByTag = {};
	  ctorByTag[float32Tag] = commonjsGlobal.Float32Array;
	  ctorByTag[float64Tag] = commonjsGlobal.Float64Array;
	  ctorByTag[int8Tag] = commonjsGlobal.Int8Array;
	  ctorByTag[int16Tag] = commonjsGlobal.Int16Array;
	  ctorByTag[int32Tag] = commonjsGlobal.Int32Array;
	  ctorByTag[uint8Tag] = Uint8Array;
	  ctorByTag[uint8ClampedTag] = commonjsGlobal.Uint8ClampedArray;
	  ctorByTag[uint16Tag] = commonjsGlobal.Uint16Array;
	  ctorByTag[uint32Tag] = commonjsGlobal.Uint32Array;

	  /**
	   * Initializes an object clone based on its `toStringTag`.
	   *
	   * **Note:** This function only supports cloning values with tags of
	   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	   *
	   * @private
	   * @param {Object} object The object to clone.
	   * @param {string} tag The `toStringTag` of the object to clone.
	   * @param {boolean} [isDeep] Specify a deep clone.
	   * @returns {Object} Returns the initialized clone.
	   */
	  function initCloneByTag(object, tag, isDeep) {
	    var Ctor = object.constructor;
	    switch (tag) {
	      case arrayBufferTag:
	        return bufferClone(object);
	      case boolTag:
	      case dateTag:
	        return new Ctor(+object);
	      case float32Tag:
	      case float64Tag:
	      case int8Tag:
	      case int16Tag:
	      case int32Tag:
	      case uint8Tag:
	      case uint8ClampedTag:
	      case uint16Tag:
	      case uint32Tag:
	        // Safari 5 mobile incorrectly has `Object` as the constructor of typed arrays.
	        if (Ctor instanceof Ctor) {
	          Ctor = ctorByTag[tag];
	        }
	        var buffer = object.buffer;
	        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
	      case numberTag:
	      case stringTag:
	        return new Ctor(object);
	      case regexpTag:
	        var result = new Ctor(object.source, reFlags.exec(object));
	        result.lastIndex = object.lastIndex;
	    }
	    return result;
	  }
	  initCloneByTag_1 = initCloneByTag;
	  return initCloneByTag_1;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	var initCloneObject_1;
	var hasRequiredInitCloneObject;
	function requireInitCloneObject() {
	  if (hasRequiredInitCloneObject) return initCloneObject_1;
	  hasRequiredInitCloneObject = 1;
	  function initCloneObject(object) {
	    var Ctor = object.constructor;
	    if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	      Ctor = Object;
	    }
	    return new Ctor();
	  }
	  initCloneObject_1 = initCloneObject;
	  return initCloneObject_1;
	}

	var baseClone_1;
	var hasRequiredBaseClone;
	function requireBaseClone() {
	  if (hasRequiredBaseClone) return baseClone_1;
	  hasRequiredBaseClone = 1;
	  var arrayCopy = requireArrayCopy(),
	    arrayEach = requireArrayEach(),
	    baseAssign = requireBaseAssign(),
	    baseForOwn = requireBaseForOwn(),
	    initCloneArray = requireInitCloneArray(),
	    initCloneByTag = requireInitCloneByTag(),
	    initCloneObject = requireInitCloneObject(),
	    isArray = requireIsArray(),
	    isHostObject = requireIsHostObject(),
	    isObject = requireIsObject();

	  /** `Object#toString` result references. */
	  var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	  var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	  /** Used to identify `toStringTag` values supported by `_.clone`. */
	  var cloneableTags = {};
	  cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	  cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = false;

	  /** Used for native method references. */
	  var objectProto = Object.prototype;

	  /**
	   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	   * of values.
	   */
	  var objToString = objectProto.toString;

	  /**
	   * The base implementation of `_.clone` without support for argument juggling
	   * and `this` binding `customizer` functions.
	   *
	   * @private
	   * @param {*} value The value to clone.
	   * @param {boolean} [isDeep] Specify a deep clone.
	   * @param {Function} [customizer] The function to customize cloning values.
	   * @param {string} [key] The key of `value`.
	   * @param {Object} [object] The object `value` belongs to.
	   * @param {Array} [stackA=[]] Tracks traversed source objects.
	   * @param {Array} [stackB=[]] Associates clones with source counterparts.
	   * @returns {*} Returns the cloned value.
	   */
	  function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	    var result;
	    if (customizer) {
	      result = object ? customizer(value, key, object) : customizer(value);
	    }
	    if (result !== undefined) {
	      return result;
	    }
	    if (!isObject(value)) {
	      return value;
	    }
	    var isArr = isArray(value);
	    if (isArr) {
	      result = initCloneArray(value);
	      if (!isDeep) {
	        return arrayCopy(value, result);
	      }
	    } else {
	      var tag = objToString.call(value),
	        isFunc = tag == funcTag;
	      if (tag == objectTag || tag == argsTag || isFunc && !object) {
	        if (isHostObject(value)) {
	          return object ? value : {};
	        }
	        result = initCloneObject(isFunc ? {} : value);
	        if (!isDeep) {
	          return baseAssign(result, value);
	        }
	      } else {
	        return cloneableTags[tag] ? initCloneByTag(value, tag, isDeep) : object ? value : {};
	      }
	    }
	    // Check for circular references and return its corresponding clone.
	    stackA || (stackA = []);
	    stackB || (stackB = []);
	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == value) {
	        return stackB[length];
	      }
	    }
	    // Add the source value to the stack of traversed objects and associate it with its clone.
	    stackA.push(value);
	    stackB.push(result);

	    // Recursively populate clone (susceptible to call stack limits).
	    (isArr ? arrayEach : baseForOwn)(value, function (subValue, key) {
	      result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	    });
	    return result;
	  }
	  baseClone_1 = baseClone;
	  return baseClone_1;
	}

	var cloneDeep_1;
	var hasRequiredCloneDeep;
	function requireCloneDeep() {
	  if (hasRequiredCloneDeep) return cloneDeep_1;
	  hasRequiredCloneDeep = 1;
	  var baseClone = requireBaseClone(),
	    bindCallback = requireBindCallback();

	  /**
	   * Creates a deep clone of `value`. If `customizer` is provided it's invoked
	   * to produce the cloned values. If `customizer` returns `undefined` cloning
	   * is handled by the method instead. The `customizer` is bound to `thisArg`
	   * and invoked with up to three argument; (value [, index|key, object]).
	   *
	   * **Note:** This method is loosely based on the
	   * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
	   * The enumerable properties of `arguments` objects and objects created by
	   * constructors other than `Object` are cloned to plain `Object` objects. An
	   * empty object is returned for uncloneable values such as functions, DOM nodes,
	   * Maps, Sets, and WeakMaps.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to deep clone.
	   * @param {Function} [customizer] The function to customize cloning values.
	   * @param {*} [thisArg] The `this` binding of `customizer`.
	   * @returns {*} Returns the deep cloned value.
	   * @example
	   *
	   * var users = [
	   *   { 'user': 'barney' },
	   *   { 'user': 'fred' }
	   * ];
	   *
	   * var deep = _.cloneDeep(users);
	   * deep[0] === users[0];
	   * // => false
	   *
	   * // using a customizer callback
	   * var el = _.cloneDeep(document.body, function(value) {
	   *   if (_.isElement(value)) {
	   *     return value.cloneNode(true);
	   *   }
	   * });
	   *
	   * el === document.body
	   * // => false
	   * el.nodeName
	   * // => BODY
	   * el.childNodes.length;
	   * // => 20
	   */
	  function cloneDeep(value, customizer, thisArg) {
	    return typeof customizer == 'function' ? baseClone(value, true, bindCallback(customizer, thisArg, 3)) : baseClone(value, true);
	  }
	  cloneDeep_1 = cloneDeep;
	  return cloneDeep_1;
	}

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
	var noop_1;
	var hasRequiredNoop;
	function requireNoop() {
	  if (hasRequiredNoop) return noop_1;
	  hasRequiredNoop = 1;
	  function noop() {
	    // No operation performed.
	  }
	  noop_1 = noop;
	  return noop_1;
	}

	/**
	 * Fake lodash
	 * Only import the parts of lodash that I'm using to reduce bundle size
	 */
	var lodash;
	var hasRequiredLodash;
	function requireLodash() {
	  if (hasRequiredLodash) return lodash;
	  hasRequiredLodash = 1;
	  lodash = {
	    // Collection
	    forEach: requireForEach(),
	    // Lang
	    isNumber: requireIsNumber(),
	    isObject: requireIsObject(),
	    isString: requireIsString(),
	    isArray: requireIsArray(),
	    isFunction: requireIsFunction(),
	    isEmpty: requireIsEmpty(),
	    keys: requireKeys(),
	    // Object
	    assign: requireAssign(),
	    forIn: requireForIn(),
	    omit: requireOmit(),
	    cloneDeep: requireCloneDeep(),
	    // Utility
	    noop: requireNoop()
	  };
	  return lodash;
	}

	var window_1;
	var hasRequiredWindow;
	function requireWindow() {
	  if (hasRequiredWindow) return window_1;
	  hasRequiredWindow = 1;
	  var win;
	  if (typeof window !== "undefined") {
	    win = window;
	  } else if (typeof commonjsGlobal !== "undefined") {
	    win = commonjsGlobal;
	  } else if (typeof self !== "undefined") {
	    win = self;
	  } else {
	    win = {};
	  }
	  window_1 = win;
	  return window_1;
	}

	/**
	  Author: github.com/duian
	  Original Repo: https://github.com/duian/js-cookies
	**/
	var jsCookies;
	var hasRequiredJsCookies;
	function requireJsCookies() {
	  if (hasRequiredJsCookies) return jsCookies;
	  hasRequiredJsCookies = 1;
	  /**
	  The MIT License (MIT)
	  	Copyright (c) 2016 zhou
	  	Permission is hereby granted, free of charge, to any person obtaining a copy
	  of this software and associated documentation files (the "Software"), to deal
	  in the Software without restriction, including without limitation the rights
	  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	  copies of the Software, and to permit persons to whom the Software is
	  furnished to do so, subject to the following conditions:
	  	The above copyright notice and this permission notice shall be included in all
	  copies or substantial portions of the Software.
	  	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	  SOFTWARE.
	  **/

	  /* eslint-disable no-useless-escape */

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
	    setItem: function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure, sameSite) {
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
	        }
	      }
	      var secureAndSameSite = '';
	      if (sameSite && sameSite.toUpperCase() === 'NONE') {
	        // if SameSite is set to None, we need to add Secure
	        // otherwise setting cookie doesn't work in some browsers
	        secureAndSameSite = '; Secure; SameSite=' + sameSite;
	      } else {
	        if (bSecure) {
	          secureAndSameSite += '; Secure';
	        }
	        if (sameSite) {
	          secureAndSameSite += '; SameSite=' + sameSite;
	        }
	      }
	      document.cookie = [encode(sKey), '=', encode(sValue), sExpires, sDomain ? '; domain=' + sDomain : '', sPath ? '; path=' + sPath : '', secureAndSameSite].join('');
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
	      var aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/);
	      aKeys = aKeys.map(function (key) {
	        return decode(key);
	      });
	      return aKeys;
	    }
	  };
	  jsCookies = Cookies;
	  return jsCookies;
	}

	var setCookie;
	var hasRequiredSetCookie;
	function requireSetCookie() {
	  if (hasRequiredSetCookie) return setCookie;
	  hasRequiredSetCookie = 1;
	  var cookie = requireJsCookies();
	  var _ = requireLodash();
	  function findDomains(domain) {
	    var domainChunks = domain.split('.');
	    var domains = [];
	    for (var i = domainChunks.length - 1; i >= 0; i--) {
	      domains.push(domainChunks.slice(i).join('.'));
	    }
	    return domains;
	  }

	  // Set cookie on highest allowed domain
	  setCookie = function setCookie(storage, name, value) {
	    var clone = _.assign({}, storage);
	    var is = {
	      ip: storage.domain.match(/\d*\.\d*\.\d*\.\d*$/),
	      local: storage.domain === 'localhost',
	      custom: storage.customDomain
	    };
	    var expires = new Date();
	    expires.setSeconds(expires.getSeconds() + clone.expires);

	    // When it's localhost, an IP, or custom domain, set the cookie directly
	    if (is.local) {
	      if (!value) {
	        cookie.removeItem(name, clone.path, clone.domain);
	      } else {
	        cookie.setItem(name, value, expires, clone.path);
	      }
	    } else if (is.ip || is.custom) {
	      if (!value) {
	        cookie.removeItem(name, clone.path, clone.domain);
	      } else {
	        cookie.setItem(name, value, expires, clone.path, clone.domain, true, 'None');
	      }
	    } else {
	      // Otherwise iterate recursively on the domain until it gets set
	      // For example, if we have three sites:
	      // bar.foo.com, baz.foo.com, foo.com
	      // First it tries setting a cookie on .com, and it fails
	      // Then it sets the cookie on foo.com, and it'll pass
	      var domains = findDomains(storage.domain);
	      var ll = domains.length;
	      var i = 0;
	      // Check cookie to see if it's "undefined".  If it is, remove it
	      if (!value) {
	        for (; i < ll; i++) {
	          cookie.removeItem(name, storage.path, domains[i]);
	        }
	      } else {
	        // already set the cookie
	        if (cookie.getItem(name) === value) return;
	        for (; i < ll; i++) {
	          clone.domain = domains[i];
	          cookie.setItem(name, value, expires, clone.path, clone.domain, true, 'None');

	          // Break when cookies aren't being cleared and it gets set properly
	          // Don't break when value is falsy so all the cookies get cleared
	          if (cookie.getItem(name) === value) {
	            // When cookie is set succesfully, save used domain in storage object
	            storage.domain = clone.domain;
	            break;
	          }
	        }
	      }
	    }
	  };
	  return setCookie;
	}

	var xhr;
	var hasRequiredXhr;
	function requireXhr() {
	  if (hasRequiredXhr) return xhr;
	  hasRequiredXhr = 1;
	  // (C) Treasure Data 2020
	  /* global XMLHttpRequest fetch */
	  var win = requireWindow();
	  var OK_STATUS = 200;
	  var NOT_MODIFIED = 304;
	  var FETCH_CREDENTIALS = {
	    'same-origin': 'same-origin',
	    include: 'include',
	    omit: 'omit'
	  };
	  var DEFAULT_CREDENTIALS = FETCH_CREDENTIALS.include;
	  function isValidStatus(status) {
	    return status >= OK_STATUS && status < 300 || status === NOT_MODIFIED;
	  }
	  function toJSON(text) {
	    var result;
	    try {
	      result = JSON.parse(text);
	    } catch (e) {
	      result = {};
	    }
	    return result;
	  }
	  function isFetchSupported() {
	    return 'fetch' in win;
	  }
	  function getCredentials(options) {
	    options = options || {};
	    return FETCH_CREDENTIALS[options.credentials] || DEFAULT_CREDENTIALS;
	  }

	  // Fetch API
	  function postWithFetch(url, body, options) {
	    options = options || {};
	    var headers = options.headers || {};
	    return fetch(url, {
	      method: 'POST',
	      headers: headers,
	      keepalive: true,
	      credentials: getCredentials(options),
	      body: JSON.stringify(body)
	    }).then(function (response) {
	      if (!response.ok) {
	        throw Error(response.statusText);
	      }
	      return response.text();
	    }).then(function (text) {
	      return toJSON(text);
	    });
	  }
	  function getWithFetch(url, options) {
	    options = options || {};
	    var headers = options.headers || {};
	    return fetch(url, {
	      method: 'GET',
	      headers: headers,
	      credentials: getCredentials(options)
	    }).then(function (response) {
	      if (!response.ok) {
	        throw Error(response.statusText);
	      }
	      return response.text();
	    }).then(function (text) {
	      return toJSON(text);
	    });
	  }
	  function registerXhrEvents(xhr, resolve, reject) {
	    xhr.onload = function onload() {
	      if (isValidStatus(xhr.status)) {
	        resolve(toJSON(xhr.responseText));
	      } else {
	        reject(new Error('Internal XMLHttpRequest error'));
	      }
	    };
	    xhr.onerror = reject;
	  }
	  function createXHR(method, url, options) {
	    options = options || {};
	    var headers = options.headers || {};
	    var xhr = new XMLHttpRequest();
	    xhr.open(method, url);
	    xhr.withCredentials = Boolean(getCredentials(options));
	    var headerKey;
	    for (headerKey in headers) {
	      if (headers.hasOwnProperty(headerKey)) {
	        xhr.setRequestHeader(headerKey, headers[headerKey]);
	      }
	    }
	    return xhr;
	  }
	  function _timeout(milliseconds, promise, timeoutMessage) {
	    var timerPromise = new Promise(function (resolve, reject) {
	      setTimeout(function () {
	        reject(new Error(timeoutMessage));
	      }, milliseconds);
	    });
	    return Promise.race([timerPromise, promise]);
	  }
	  function postWithTimeout(url, body, milliseconds, options) {
	    if (window.AbortController) {
	      var controller = new window.AbortController();
	      var promise = postWithFetch(url, body, Object.assign({}, options, {
	        signal: controller.signal
	      }));
	      var timeoutId = setTimeout(function () {
	        controller.abort();
	      }, milliseconds);
	      return promise['finally'](function () {
	        clearTimeout(timeoutId);
	      });
	    } else {
	      return _timeout(milliseconds, postWithFetch(url, body, options), 'Request Timeout');
	    }
	  }
	  xhr = {
	    post: function post(url, body, options) {
	      if (isFetchSupported()) {
	        return postWithFetch(url, body, options);
	      }
	      return new Promise(function (resolve, reject) {
	        var xhr = createXHR('POST', url, options);
	        registerXhrEvents(xhr, resolve, reject);
	        xhr.send(JSON.stringify(body));
	      });
	    },
	    get: function get(url, options) {
	      options = options || {};
	      if (isFetchSupported()) {
	        return getWithFetch(url, options);
	      }
	      return new Promise(function (resolve, reject) {
	        var xhr = createXHR('GET', url, options);
	        registerXhrEvents(xhr, resolve, reject);
	        xhr.send(null);
	      });
	    },
	    postWithTimeout: postWithTimeout
	  };
	  return xhr;
	}

	/**
	 * Treasure Record
	 */
	var hasRequiredRecord;
	function requireRecord() {
	  if (hasRequiredRecord) return record;
	  hasRequiredRecord = 1;
	  // Modules
	  var misc = requireMisc();
	  var _ = requireLodash();
	  var global = requireWindow();
	  var cookie = requireJsCookies();
	  var setCookie = requireSetCookie();
	  var api = requireXhr();
	  var noop = _.noop;
	  var invariant = misc.invariant;
	  // Helpers

	  /*
	   * Validate record
	   */
	  function validateRecord(table, record) {
	    invariant(_.isString(table), 'Must provide a table');
	    invariant(/^[a-z0-9_]{3,255}$/.test(table), 'Table must be between 3 and 255 characters and must ' + 'consist only of lower case letters, numbers, and _');
	    invariant(_.isObject(record), 'Must provide a record');
	  }
	  var BLOCKEVENTSCOOKIE = '__td_blockEvents';
	  var SIGNEDMODECOOKIE = '__td_signed';
	  record.BLOCKEVENTSCOOKIE = BLOCKEVENTSCOOKIE;
	  record.SIGNEDMODECOOKIE = SIGNEDMODECOOKIE;

	  /**
	   * @Treasure.blockEvents
	   * Block all events from being sent to Treasure Data.
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.trackEvent('customevent')
	   * td.blockEvents()
	   * td.trackEvent('willnotbetracked')
	   */
	  record.blockEvents = function blockEvents() {
	    setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'true');
	  };

	  /**
	   * @Treasure.unblockEvents
	   * Unblock all events; events will be sent to Treasure Data.
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.blockEvents()
	   * td.trackEvent('willnotbetracked')
	   * td.unblockEvents()
	   * td.trackEvent('willbetracked')
	   */
	  record.unblockEvents = function unblockEvents() {
	    setCookie(this.client.storage, BLOCKEVENTSCOOKIE, 'false');
	  };

	  /**
	   * @Treasure.areEventsBlocked
	   * Informational method, expressing whether events are blocked or not.
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.areEventsBlocked() // false, default
	   * td.blockEvents()
	   * td.areEventsBlocked() // true
	   */
	  record.areEventsBlocked = function areEventsBlocked() {
	    return cookie.getItem(BLOCKEVENTSCOOKIE) === 'true';
	  };

	  /**
	   * @Treasure.setSignedMode
	   * Sets the user to Signed Mode.
	   * Permit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.setSignedMode()
	   * td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
	   */
	  record.setSignedMode = function setSignedMode() {
	    if (this.client.storeConsentByLocalStorage) {
	      if (!misc.isLocalStorageAccessible()) return this;
	      global.localStorage.setItem(SIGNEDMODECOOKIE, 'true');
	    } else {
	      setCookie(this.client.storage, SIGNEDMODECOOKIE, 'true');
	    }
	    this.resetUUID(this.client.storage, this.client.track.uuid);
	    return this;
	  };

	  /**
	   * @Treasure.setAnonymousMode
	   *
	   * Sets the user to anonymous mode.
	   * Prohibit sending of Personally Identifying Information over the wire: td_ip, td_client_id, and td_global_id
	   *
	   * @param {boolean} keepIdentifier - Keep the cookies. By default setAnonymousMode will remove all cookies that are set by Treasure Data JavaScript SDK, you can set keepIdentifier parameter to true to not remove the cookies.
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.setAnonymousMode()
	   * td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
	   */
	  record.setAnonymousMode = function setAnonymousMode(keepIdentifier) {
	    if (this.client.storeConsentByLocalStorage) {
	      if (!misc.isLocalStorageAccessible()) return this;
	      global.localStorage.setItem(SIGNEDMODECOOKIE, 'false');
	    } else {
	      setCookie(this.client.storage, SIGNEDMODECOOKIE, 'false');
	    }
	    if (!keepIdentifier) {
	      // remove _td cookie
	      setCookie(this.client.storage, this.client.storage.name);

	      // remove global id cookie
	      this.removeCachedGlobalID();

	      // remove server side cookie
	      this.removeServerCookie();
	    }
	    return this;
	  };

	  /**
	   * @Treasure.inSignedMode
	   *
	   * Tells whether or not the user is in Signed Mode.
	   * Informational method, indicating whether trackEvents method will automatically collect td_ip, td_client_id, and td_global_id if set.
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.inSignedMode() // false, default
	   * td.trackEvent('willbetracked') // will NOT send td_ip and td_client_id; td_global_id will also NOT be sent if set.
	   * td.setSignedMode()
	   * td.inSignedMode() // true
	   * td.trackEvent('willbetracked') // will send td_ip and td_client_id; td_global_id will also be sent if set.
	   */
	  record.inSignedMode = function inSignedMode() {
	    if (this.client.storeConsentByLocalStorage) {
	      if (!misc.isLocalStorageAccessible()) return false;
	      return global.localStorage.getItem([SIGNEDMODECOOKIE]) !== 'false' && (global.localStorage.getItem([SIGNEDMODECOOKIE]) === 'true' || this.client.startInSignedMode);
	    }
	    return cookie.getItem(SIGNEDMODECOOKIE) !== 'false' && (cookie.getItem(SIGNEDMODECOOKIE) === 'true' || this.client.startInSignedMode);
	  };

	  /*
	   * Send record
	   */
	  record._sendRecord = function _sendRecord(request, success, error, blockedEvent) {
	    success = success || noop;
	    error = error || noop;
	    if (blockedEvent) {
	      return;
	    }
	    var params = ['modified=' + encodeURIComponent(new Date().getTime())];
	    if (request.time) {
	      params.push('time=' + encodeURIComponent(request.time));
	    }
	    var url = request.url + '?' + params.join('&');
	    var isClickedLink = request.record.tag === 'a' && !!request.record.href;
	    var requestHeaders = {};
	    var payload;
	    requestHeaders['Authorization'] = 'TD1 ' + request.apikey;
	    requestHeaders['User-Agent'] = navigator.userAgent;
	    if (this.inSignedMode() && this.isGlobalIdEnabled()) {
	      requestHeaders['Content-Type'] = misc.globalIdAdlHeaders['Content-Type'];
	      requestHeaders['Accept'] = misc.globalIdAdlHeaders['Accept'];
	    } else {
	      requestHeaders['Content-Type'] = misc.adlHeaders['Content-Type'];
	      requestHeaders['Accept'] = misc.adlHeaders['Accept'];
	    }
	    payload = {
	      events: [request.record]
	    };
	    if (window.fetch && (this._windowBeingUnloaded || isClickedLink)) {
	      api.postWithTimeout(url, payload, this.client.jsonpTimeout, {
	        method: 'POST',
	        keepalive: true,
	        credentials: 'include',
	        headers: requestHeaders
	      }).then(success).catch(error);
	    } else {
	      api.post(url, payload, {
	        headers: requestHeaders
	      }).then(success).catch(error);
	    }
	  };

	  // Methods

	  /*
	   * Treasure#applyProperties
	   *
	   * Applies properties on a payload object
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
	  record.applyProperties = function applyProperties(table, payload) {
	    return _.assign({}, this.get('$global'), this.get(table), payload);
	  };

	  /**
	   * Sends an event to Treasure Data. If the table does not exist it will be created for you.
	   * Records will have additional properties applied to them if $global or table-specific attributes are configured using Treasure#set.
	   *
	   * @param {string}  table     - table name, must consist only of lower case letters, numbers, and _, must be longer than or equal to 3 chars, the total length of database and table must be shorter than 129 chars.
	   * @param {object}  record    - Object that will be serialized to JSON and sent to the server
	   * @param {boolean=} [success] - Callback for when sending the event is successful
	   * @param {boolean=} [error]   - Callback for when sending the event is unsuccessful
	   */
	  record.addRecord = function addRecord(table, record, success, error) {
	    validateRecord(table, record);
	    var propertiesRecord = this.applyProperties(table, record);
	    var finalRecord = this.inSignedMode() ? propertiesRecord : _.omit(propertiesRecord, ['td_ip', 'td_client_id', 'td_global_id']);
	    var request = {
	      apikey: this.client.writeKey,
	      record: finalRecord,
	      time: null,
	      type: this.client.requestType,
	      url: this.client.endpoint + this.client.database + '/' + table
	    };
	    if (request.record.time) {
	      request.time = request.record.time;
	    }
	    if (this.client.development) {
	      this.log('addRecord', request);
	    } else if (!this.areEventsBlocked()) {
	      this._sendRecord(request, success, error, this.areEventsBlocked());
	    }
	  };
	  record.addConsentRecord = function addConsentRecord(table, record, success, error) {
	    validateRecord(table, record);
	    var request = {
	      apikey: this.client.writeKey,
	      record: record,
	      time: null,
	      type: this.client.requestType,
	      url: this.client.endpoint + this.client.database + '/' + table
	    };
	    if (request.record.time) {
	      request.time = request.record.time;
	    }
	    if (this.client.development) {
	      this.log('addConsentRecord', request);
	    } else {
	      this._sendRecord(request, success, error, false);
	    }
	  };

	  // Private functions, for testing only
	  record._validateRecord = validateRecord;
	  return record;
	}

	var configurator = {};

	var config;
	var hasRequiredConfig;
	function requireConfig() {
	  if (hasRequiredConfig) return config;
	  hasRequiredConfig = 1;
	  config = {
	    GLOBAL: 'Treasure',
	    VERSION: '4.4.1',
	    HOST: 'us01.records.in.treasuredata.com',
	    DATABASE: '',
	    PATHNAME: '/'
	  };
	  return config;
	}

	/*
	 * Treasure Configurator
	 */
	var hasRequiredConfigurator;
	function requireConfigurator() {
	  if (hasRequiredConfigurator) return configurator;
	  hasRequiredConfigurator = 1;
	  (function (exports) {
	    // Modules
	    var _ = requireLodash();
	    var invariant = requireMisc().invariant;
	    var config = requireConfig();
	    var cookie = requireJsCookies();

	    // Helpers
	    function validateOptions(options) {
	      // options must be an object
	      invariant(_.isObject(options), 'Check out our JavaScript SDK Usage Guide: ' + 'https://github.com/treasure-data/td-js-sdk#api');
	      invariant(_.isString(options.writeKey), 'Must provide a writeKey');
	      invariant(_.isString(options.database), 'Must provide a database');
	      invariant(/^[a-z0-9_]{3,255}$/.test(options.database), 'Database must be between 3 and 255 characters and must ' + 'consist only of lower case letters, numbers, and _');
	    }
	    var defaultSSCCookieDomain = function () {
	      var domainChunks = document.location.hostname.split('.');
	      for (var i = domainChunks.length - 2; i >= 1; i--) {
	        var domain = domainChunks.slice(i).join('.');
	        var name = '_td_domain_' + domain; // append domain name to avoid race condition
	        cookie.setItem(name, domain, 3600, '/', domain);
	        if (cookie.getItem(name) === domain) {
	          return domain;
	        }
	      }
	      return document.location.hostname;
	    };

	    // Default config for library values
	    exports.DEFAULT_CONFIG = {
	      database: config.DATABASE,
	      development: false,
	      globalIdCookie: '_td_global',
	      host: config.HOST,
	      logging: true,
	      pathname: config.PATHNAME,
	      requestType: 'fetch',
	      jsonpTimeout: 10000,
	      startInSignedMode: false,
	      useServerSideCookie: false,
	      sscDomain: defaultSSCCookieDomain,
	      sscServer: function (cookieDomain) {
	        return ['ssc', cookieDomain].join('.');
	      },
	      storeConsentByLocalStorage: false
	    };

	    /*
	     * Initial configurator
	     * Checks validity
	     * Creates and sets up client object
	     *
	     * Modify DEFAULT_CONFIG to change any defaults
	     * Protocol defaults to auto-detection but can be set manually
	     * host defaults to in.treasuredata.com
	     * pathname defaults to /js/v3/event/
	     * requestType is always fetch
	     *
	     * */
	    exports.configure = function configure(options) {
	      this.client = _.assign({
	        globals: {}
	      }, exports.DEFAULT_CONFIG, options, {
	        requestType: 'fetch'
	      });
	      validateOptions(this.client);
	      if (!this.client.endpoint) {
	        this.client.endpoint = 'https://' + this.client.host + this.client.pathname;
	      }
	      return this;
	    };

	    /**
	     * Useful when you want to set multiple values.
	     * Table value setter
	     * When you set mutliple attributes, the object is iterated and values are set on the table
	     * Attributes are not recursively set on the table
	     *
	     * @param {string} table - table name
	     * @param {object} properties - Object with keys and values that you wish applies on the table each time a record is sent
	     *
	     * @example
	     * var td = new Treasure({...})
	     * td.set('table', {foo: 'foo', bar: 'bar'});
	     * td.addRecord('table', {baz: 'baz'});
	     * //  Sends:
	     * // {
	     * //   "foo": "foo",
	     * //   "bar": "bar",
	     * //   "baz": "baz"
	     * // }
	     */
	    exports.set = function set(table, property, value) {
	      if (_.isObject(table)) {
	        property = table;
	        table = '$global';
	      }
	      this.client.globals[table] = this.client.globals[table] || {};
	      if (_.isObject(property)) {
	        _.assign(this.client.globals[table], property);
	      } else {
	        this.client.globals[table][property] = value;
	      }
	      return this;
	    };

	    /**
	     * Takes a table name and returns an object with its default values.
	     * If the table does not exist, its object gets created
	     *
	     * NOTE: This is only available once the library has loaded. Wrap any getter with a Treasure#ready callback to ensure the library is loaded.
	     *
	     * @param {string} table - table name
	     * @param {string} [key] - Optional key to get from the table
	     *
	     * @example <caption>Getting all rows in a table</caption>
	     * var td = new Treasure({..});
	     * td.set('table', 'foo', 'bar');
	     * td.get('table');
	     * // {foo: 'bar'}
	     *
	     * @example <caption>Getting a single attribute</caption>
	     * var td = new Treasure({..});
	     * td.get('table', 'foo')
	     * // > 'bar'
	     */
	    exports.get = function get(table, key) {
	      // If no table, show $global
	      table = table || '$global';
	      this.client.globals[table] = this.client.globals[table] || {};
	      return key ? this.client.globals[table][key] : this.client.globals[table];
	    };
	    exports.isGlobalIdEnabled = function () {
	      return this.get(null, 'td_global_id') === 'td_global_id';
	    };
	  })(configurator);
	  return configurator;
	}

	var version;
	var hasRequiredVersion;
	function requireVersion() {
	  if (hasRequiredVersion) return version;
	  hasRequiredVersion = 1;
	  version = requireConfig().VERSION;
	  return version;
	}

	var ready = {exports: {}};

	/*!
	  * domready (c) Dustin Diaz 2012 - License MIT
	  */
	var hasRequiredReady;
	function requireReady() {
	  if (hasRequiredReady) return ready.exports;
	  hasRequiredReady = 1;
	  (function (module) {
	    !function (name, definition) {
	      module.exports = definition();
	    }('domready', function (ready) {
	      var fns = [],
	        fn,
	        f = false,
	        doc = document,
	        testEl = doc.documentElement,
	        hack = testEl.doScroll,
	        domContentLoaded = 'DOMContentLoaded',
	        addEventListener = 'addEventListener',
	        onreadystatechange = 'onreadystatechange',
	        readyState = 'readyState',
	        loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/,
	        loaded = loadedRgx.test(doc[readyState]);
	      function flush(f) {
	        loaded = 1;
	        while (f = fns.shift()) f();
	      }
	      doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
	        doc.removeEventListener(domContentLoaded, fn, f);
	        flush();
	      }, f);
	      hack && doc.attachEvent(onreadystatechange, fn = function () {
	        if (/^c/.test(doc[readyState])) {
	          doc.detachEvent(onreadystatechange, fn);
	          flush();
	        }
	      });
	      return ready = hack ? function (fn) {
	        self != top ? loaded ? fn() : fns.push(fn) : function () {
	          try {
	            testEl.doScroll('left');
	          } catch (e) {
	            return setTimeout(function () {
	              ready(fn);
	            }, 50);
	          }
	          fn();
	        }();
	      } : function (fn) {
	        loaded ? fn() : fns.push(fn);
	      };
	    });
	  })(ready);
	  return ready.exports;
	}

	var element;
	var hasRequiredElement;
	function requireElement() {
	  if (hasRequiredElement) return element;
	  hasRequiredElement = 1;
	  var forEach = requireLodash().forEach;
	  var isString = requireLodash().isString;
	  var disposable = requireMisc().disposable;

	  // Info: http://www.quirksmode.org/js/events_properties.html
	  function getEventTarget(event) {
	    // W3C says it's event.target, but IE8 uses event.srcElement
	    var target = event.target || event.srcElement || window.document;

	    // If an event takes place on an element that contains text, this text node,
	    // and not the element, becomes the target of the event
	    return target.nodeType === 3 ? target.parentNode : target;
	  }
	  function addEventListener(el, type, fn) {
	    if (el.addEventListener) {
	      el.addEventListener(type, handler, false);
	      return disposable(function () {
	        el.removeEventListener(type, handler, false);
	      });
	    } else if (el.attachEvent) {
	      el.attachEvent('on' + type, handler);
	      return disposable(function () {
	        el.detachEvent('on' + type, handler);
	      });
	    } else {
	      throw new Error('addEventListener');
	    }

	    // IE8 doesn't pass an event param, grab it from the window if it's missing
	    // Calls the real handler with the correct context, even if we don't use it
	    function handler(event) {
	      fn.call(el, event || window.event);
	    }
	  }
	  function findElement(el) {
	    if (!el || !el.tagName) {
	      return null;
	    }
	    for (var tag = el.tagName.toLowerCase(); tag && tag !== 'body'; el = el.parentNode, tag = el && el.tagName && el.tagName.toLowerCase()) {
	      var type = el.getAttribute('type');
	      if (tag === 'input' && type === 'password') {
	        return null;
	      }
	      var role = el.getAttribute('role');
	      if (role === 'button' || role === 'link' || tag === 'a' || tag === 'button' || tag === 'input') {
	        return el;
	      }
	    }
	    return null;
	  }
	  function createTreeHasIgnoreAttribute(ignoreAttribute) {
	    var dataIgnoreAttribute = 'data-' + ignoreAttribute;
	    return function treeHasIgnoreAttribute(el) {
	      if (!el || !el.tagName || el.tagName.toLowerCase() === 'html') {
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
	      tag: el.tagName.toLowerCase(),
	      tree: htmlTreeAsString(el)
	    };
	    forEach(['alt', 'class', 'href', 'id', 'name', 'role', 'title', 'type'], function (attrName) {
	      if (hasAttribute(el, attrName)) {
	        data[attrName] = el.getAttribute(attrName);
	      }
	    });
	    return data;
	  }

	  /**
	   * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
	   * Given a child DOM element, returns a query-selector statement describing that
	   * and its ancestors
	   * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
	   * @param elem
	   * @returns {string}
	   */
	  function htmlTreeAsString(elem) {
	    var MAX_TRAVERSE_HEIGHT = 5;
	    var MAX_OUTPUT_LEN = 80;
	    var out = [];
	    var height = 0;
	    var len = 0;
	    var separator = ' > ';
	    var sepLength = separator.length;
	    var nextStr;
	    while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
	      nextStr = htmlElementAsString(elem);
	      // bail out if
	      // - nextStr is the 'html' element
	      // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
	      //   (ignore this limit if we are on the first iteration)
	      if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN) {
	        break;
	      }
	      out.push(nextStr);
	      len += nextStr.length;
	      elem = elem.parentNode;
	    }
	    return out.reverse().join(separator);
	  }

	  /**
	   * ORIGINAL SOURCE: https://github.com/getsentry/raven-js/
	   * Returns a simple, query-selector representation of a DOM element
	   * e.g. [HTMLElement] => input#foo.btn[name=baz]
	   * @param HTMLElement
	   * @returns {string}
	   */
	  function htmlElementAsString(elem) {
	    var out = [];
	    var className;
	    var classes;
	    var key;
	    var attr;
	    var i;
	    if (!elem || !elem.tagName) {
	      return '';
	    }
	    out.push(elem.tagName.toLowerCase());
	    if (elem.id) {
	      out.push('#' + elem.id);
	    }
	    className = elem.className;
	    if (className && isString(className)) {
	      classes = className.split(' ');
	      for (i = 0; i < classes.length; i++) {
	        out.push('.' + classes[i]);
	      }
	    }
	    var attrWhitelist = ['type', 'name', 'title', 'alt'];
	    for (i = 0; i < attrWhitelist.length; i++) {
	      key = attrWhitelist[i];
	      attr = elem.getAttribute(key);
	      if (attr) {
	        out.push('[' + key + '="' + attr + '"]');
	      }
	    }
	    return out.join('');
	  }

	  /* IE8 does NOT implement hasAttribute */
	  function hasAttribute(element, attrName) {
	    if (typeof element.hasAttribute === 'function') {
	      return element.hasAttribute(attrName);
	    }
	    return element.getAttribute(attrName) !== null;
	  }
	  element = {
	    addEventListener: addEventListener,
	    createTreeHasIgnoreAttribute: createTreeHasIgnoreAttribute,
	    getElementData: getElementData,
	    getEventTarget: getEventTarget,
	    hasAttribute: hasAttribute,
	    htmlElementAsString: htmlElementAsString,
	    htmlTreeAsString: htmlTreeAsString,
	    findElement: findElement
	  };
	  return element;
	}

	var clicks;
	var hasRequiredClicks;
	function requireClicks() {
	  if (hasRequiredClicks) return clicks;
	  hasRequiredClicks = 1;
	  var window = requireWindow();
	  var elementUtils = requireElement();
	  var assign = requireLodash().assign;
	  var disposable = requireMisc().disposable;
	  function defaultExtendClickData(event, data) {
	    return data;
	  }
	  function configure() {
	    this._clickTrackingInstalled = false;
	  }

	  /**
	   * Setup an event listener to automatically log clicks.
	   * The event will be hooked only follows
	   * - `role=button` or `role=link`
	   * - `<a>`
	   * - `<button>`
	   * - `<input>)`. exclude for `<input type='password'>`
	   *
	   * @param    {object}   trackClickOptions - object containing configuration information
	   * @property {string}   element           - Default is window.document. Default setting will observe all elements above. You can set an element if you want to focus on a particular element.
	   * @property {function} extendClickData   - Default is function to set element attributes. You can set function adding special tracking data by extending function(e: event, elementData: ElementObject).
	   * @property {string}   ignoreAttribute   - Default is "td-ignore" You can set attribute name to ignore element. (e.g. <span role='button' class='button-design' id='button-id' td-ignore />)
	   * @property {string}   tableName         - Default tableName is "clicks". Click tracking event will be stored into tableName in TreasureData
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.trackClicks({
	   *     element         : '...'
	   *     extendClickData : '...'
	   *     ignoreAttribute : '...'
	   *     tableName       : '...'
	   *     })
	   *
	   */
	  function trackClicks(trackClicksOptions) {
	    if (this._clickTrackingInstalled) return;
	    var instance = this;
	    var options = assign({
	      element: window.document,
	      extendClickData: defaultExtendClickData,
	      ignoreAttribute: 'td-ignore',
	      tableName: 'clicks'
	    }, trackClicksOptions);
	    var treeHasIgnoreAttribute = elementUtils.createTreeHasIgnoreAttribute(options.ignoreAttribute);
	    var removeClickTracker = elementUtils.addEventListener(options.element, 'click', clickTracker);
	    instance._clickTrackingInstalled = true;
	    return disposable(function () {
	      removeClickTracker();
	      instance._clickTrackingInstalled = false;
	    });
	    function clickTracker(e) {
	      var target = elementUtils.findElement(elementUtils.getEventTarget(e));
	      if (target && !treeHasIgnoreAttribute(target)) {
	        var elementData = elementUtils.getElementData(target);
	        var data = options.extendClickData(e, elementData);
	        if (data) {
	          instance.trackEvent(options.tableName, data);
	        }
	      }
	    }
	  }
	  clicks = {
	    configure: configure,
	    trackClicks: trackClicks
	  };
	  return clicks;
	}

	/**
	 * Treasure Global ID
	 */
	var globalid;
	var hasRequiredGlobalid;
	function requireGlobalid() {
	  if (hasRequiredGlobalid) return globalid;
	  hasRequiredGlobalid = 1;
	  // Modules
	  var noop = requireLodash().noop;
	  var misc = requireMisc();
	  var cookie = requireJsCookies();
	  var api = requireXhr();
	  function cacheSuccess(result, cookieName, cookieOptions) {
	    cookieOptions = cookieOptions || {};
	    if (!result['global_id']) {
	      return null;
	    }
	    var path = cookieOptions.path;
	    var domain = cookieOptions.domain;
	    var secure = cookieOptions.secure;
	    var maxAge = cookieOptions.maxAge || 6000;
	    var sameSite = cookieOptions.sameSite;
	    cookie.setItem(cookieName, result['global_id'], maxAge, path, domain, secure, sameSite);
	    return result['global_id'];
	  }
	  function configure() {
	    return this;
	  }

	  /**
	   * @param    {function}           [success]          - Callback for when sending the event is successful
	   * @param    {function}           [error]            - Callback for when sending the event is unsuccessful
	   * @param    {boolean}            [forceFetch]       - Forces a refetch of global id and ignores cached version (default false)
	   * @param    {object}             [options]          - Cookie options Note: If you set the sameSite value to None, the Secure property of the cookie will be set to true (it overwrites the secure option). More details on SameSite cookies.
	   * @property {string}             [options.path]     - '/',
	   * @property {string}             [options.domain]   - 'mycompany.com',
	   * @property {boolean}            [options.secure]   - true|false,
	   * @property {number|string|date} [options.maxAge]   - Number | String | Date,
	   * @property {string}             [options.sameSite] - 'None | Lax | Strict'
	   *
	   * @example <caption>Cookie options: Note - If you set the sameSite value to None, the Secure property of the cookie will be set to true (it overwrites the secure option). More details on SameSite cookies.</caption>
	   * {
	   *   path: '/',
	   *   domain: 'abc.com',
	   *   secure: true|false,
	   *   maxAge: Number | String | Date,
	   *   sameSite: 'None | Lax | Strict'
	   * }
	   *
	   * @example
	   * var td = new Treasure({...})
	   *
	   * var successCallback = function (globalId) {
	   *   // celebrate();
	   * };
	   *
	   * var errorCallback = function (error) {
	   *   // cry();
	   * }
	   *
	   * td.fetchGlobalID(successCallback, errorCallback)
	   *
	   * // with cookie options
	   * td.fetchGlobalID(successCallback, errorCallback, true, {
	   *   path: '/',
	   *   secure: true,
	   *   maxAge: 5 * 60 // 5 minutes,
	   *   sameSite: 'None'
	   * })
	   */
	  function fetchGlobalID(success, error, forceFetch, options) {
	    options = options || {};
	    success = success || noop;
	    error = error || noop;
	    if (!this.inSignedMode()) {
	      return error('not in signed in mode');
	    }
	    if (!this.isGlobalIdEnabled()) {
	      return error('global id is not enabled');
	    }
	    var cookieName = this.client.globalIdCookie;
	    var cachedGlobalId = cookie.getItem(cookieName);
	    if (cachedGlobalId && !forceFetch) {
	      return setTimeout(function () {
	        success(cachedGlobalId);
	      }, 0);
	    }
	    if (!options.sameSite) {
	      options.sameSite = 'None';
	    }
	    var url = 'https://' + this.client.host;
	    var requestHeaders = {};
	    requestHeaders['Authorization'] = 'TD1 ' + this.client.writeKey;
	    requestHeaders['User-Agent'] = navigator.userAgent;
	    requestHeaders['Content-Type'] = misc.globalIdAdlHeaders['Content-Type'];
	    requestHeaders['Accept'] = misc.globalIdAdlHeaders['Accept'];
	    api.get(url, {
	      headers: requestHeaders
	    }).then(function (res) {
	      var cachedId = cacheSuccess(res, cookieName, options);
	      success(cachedId);
	    }).catch(function (err) {
	      error(err);
	    });
	  }
	  function removeCachedGlobalID() {
	    cookie.removeItem(this.client.globalIdCookie);
	  }
	  globalid = {
	    cacheSuccess: cacheSuccess,
	    configure: configure,
	    fetchGlobalID: fetchGlobalID,
	    removeCachedGlobalID: removeCachedGlobalID
	  };
	  return globalid;
	}

	var personalization;
	var hasRequiredPersonalization;
	function requirePersonalization() {
	  if (hasRequiredPersonalization) return personalization;
	  hasRequiredPersonalization = 1;
	  var invariant = requireMisc().invariant;
	  var _ = requireLodash();
	  var api = requireXhr();
	  var noop = _.noop;

	  /*
	   * @param {object} config - configuration object
	   * @property {string} config.cdpHost - The host to use for the Personalization API, defaults to 'cdp.in.treasuredata.com' .
	   *
	   * @example
	   *    Possible values:
	   *    Region                    cdpHost                       host
	   *    AWS East                  cdp.in.treasuredata.com       in.treasuredata.com
	   *    AWS Tokyo                 cdp-tokyo.in.treasuredata.com tokyo.in.treasuredata.com
	   *    AWS EU                    cdp-eu01.in.treasuredata.com  eu01.in.treasuredata.com
	   *    AWS Asia Pacific (Seoul)  cdp-ap02.in.treasturedata.com ap02.in.treasuredata.com
	   *    AWS Asia Pacific (Tokyo)  cdp-ap03.in.treasturedata.com ap03.in.treasuredata.com
	   */
	  function configure(config) {
	    config = _.isObject(config) ? config : {};
	    this.client.cdpHost = config.cdpHost || 'cdp.in.treasuredata.com';
	    return this;
	  }

	  /**
	   * @param {object} options - User Segment object
	   * @param {string|array} options.audienceToken - Audience Token(s) for the userId
	   * @property {object} options.keys - Key Value to be sent for this segment
	   * @param {function} [success] - Callback for receiving the user key and segments
	   * @param {function} [error] - Callback for when sending the event is unsuccessful
	   *
	   * @example <caption>N.B. This feature is not enabled on accounts by default, please contact support for more information.</caption>
	   * var td = new Treasure({...})
	   * var successCallback = function (values) {
	   *   //values format => [... {
	   *   //  key: {
	   *   //    [key]:value
	   *   //  },
	   *   //  values: ["1234"],
	   *   //  attributes: {
	   *   //    age: 30
	   *   //  },
	   *   //} ... ]
	   *
	   *   // celebrate();
	   * };
	   * var errorCallback = function (error) {
	   *   // cry();
	   * };
	   * td.fetchUserSegments({
	   *   audienceToken: ['token1', 'token2'],
	   *   keys: {
	   *     someKey: 'someValue',
	   *     someOtherKey: 'someOtherValue',
	   *   }
	   * }, successCallback, errorCallback)
	   */
	  function fetchUserSegments(tokenOrConfig, successCallback, errorCallback) {
	    var isConfigObject = _.isObject(tokenOrConfig) && !_.isArray(tokenOrConfig);
	    var audienceToken = isConfigObject ? tokenOrConfig.audienceToken : tokenOrConfig;
	    var keys = isConfigObject && tokenOrConfig.keys || {};
	    successCallback = successCallback || noop;
	    errorCallback = errorCallback || noop;
	    invariant(typeof audienceToken === 'string' || _.isArray(audienceToken), 'audienceToken must be a string or array; received "' + audienceToken.toString() + '"');
	    invariant(_.isObject(keys), 'keys must be an object; received "' + keys + '"');
	    var token = _.isArray(audienceToken) ? audienceToken.join(',') : audienceToken;
	    var keysName = _.keys(keys);
	    var keysArray = [];
	    _.forEach(keysName, function (key) {
	      keysArray.push(['key.', key, '=', keys[key]].join(''));
	    });
	    var keyString = keysArray.join('&');
	    var url = 'https://' + this.client.cdpHost + '/cdp/lookup/collect/segments?version=2&token=' + token + (keyString && '&' + keyString);
	    api.get(url, {
	      headers: {
	        'Content-Type': 'application/json'
	      }
	    }).then(successCallback).catch(errorCallback);
	  }

	  /**
	  * Fetch personalization information
	  *
	  * @param {object} config - configuration object
	  * @param config.endpoint - Personalization endpoint
	  * @param config.database - Database name
	  * @param config.table - Table name
	  * @param config.token - Personalization token
	  *
	  * @param {object} data - (Optional) payload to send with the request
	  * @param {function} successCallback - Callback for successful request
	  * @param {function} errorCallback - Callback for failed quest
	  *
	  * @example
	  * var td = new Treasure({...})
	  * var successCallback = function (values) {
	  *   //values format => {
	  *     "offers": {
	  *       "offer": {
	  *         "attributes": {
	  *           "first_name": "test",
	  *           "nickname": "tet"
	  *         },
	  *         "batch_segments": 55352
	  *       }
	  *      }
	  *    }
	  *
	  *   // celebrate();
	  * }
	  * var errorCallback = function (error) {
	  *   // cry();
	  * }
	  *
	  * td.fetchPersonalization({
	  *   endpoint: 'endpoint',
	  *   database: 'database',
	  *   table: 'table',
	  *   token: 'personalization token'
	  * }, null, successCallback, errorCallback)
	  *
	  */

	  function fetchPersonalization(config, data, successCallback, errorCallback) {
	    invariant(_.isObject(config), 'config must be an object, received "' + config + '"');
	    invariant(config.endpoint, 'endpoint is invalid');
	    invariant(config.database, 'database is invalid');
	    invariant(config.table, 'table is invalid');
	    invariant(config.token, 'token is invalid');
	    successCallback = successCallback || noop;
	    errorCallback = errorCallback || noop;
	    var url = ['https://', config.endpoint, '/public/', config.database, '/', config.table].join('');
	    var payload = data || {};
	    api.post(url, payload, {
	      headers: {
	        'Content-Type': 'application/vnd.treasuredata.v1+json',
	        'Authorization': 'TD1 ' + this.client.writeKey,
	        'WP13n-Token': config.token
	      }
	    }).then(successCallback).catch(errorCallback);
	  }
	  personalization = {
	    configure: configure,
	    fetchUserSegments: fetchUserSegments,
	    fetchPersonalization: fetchPersonalization
	  };
	  return personalization;
	}

	var track = {};

	var generateUUID;
	var hasRequiredGenerateUUID;
	function requireGenerateUUID() {
	  if (hasRequiredGenerateUUID) return generateUUID;
	  hasRequiredGenerateUUID = 1;
	  // Maybe look into a more legit solution later
	  // node-uuid doesn't work with old IE's
	  // Source: http://stackoverflow.com/a/8809472
	  var window = requireWindow();
	  generateUUID = function generateUUID() {
	    var d = new Date().getTime();
	    if (window.performance && typeof window.performance.now === 'function') {
	      d += window.performance.now(); // use high-precision timer if available
	    }
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	      var r = (d + Math.random() * 16) % 16 | 0;
	      d = Math.floor(d / 16);
	      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
	    });
	    return uuid;
	  };
	  return generateUUID;
	}

	/*!
	* ----------------------
	* Treasure Tracker
	* ----------------------
	*/
	var hasRequiredTrack;
	function requireTrack() {
	  if (hasRequiredTrack) return track;
	  hasRequiredTrack = 1;
	  // Modules
	  var window = requireWindow();
	  var _ = requireLodash();
	  var cookie = requireJsCookies();
	  var setCookie = requireSetCookie();
	  var generateUUID = requireGenerateUUID();
	  var version = requireVersion();
	  var document = window.document;

	  // Helpers
	  function configureValues(track) {
	    return _.assign({
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
	        var clientHeight = document.documentElement && document.documentElement.clientHeight;
	        var clientWidth = document.documentElement && document.documentElement.clientWidth;
	        var innerHeight = window.innerHeight;
	        var innerWidth = window.innerWidth;
	        var height = clientHeight < innerHeight ? innerHeight : clientHeight;
	        var width = clientWidth < innerWidth ? innerWidth : clientWidth;
	        return width + 'x' + height;
	      },
	      td_title: function () {
	        return document.title;
	      },
	      td_description: function () {
	        return getMeta('description');
	      },
	      td_url: function () {
	        return !document.location || !document.location.href ? '' : document.location.href.split('#')[0];
	      },
	      td_user_agent: function () {
	        var userAgent = window.navigator.userAgent;
	        var sdkUserAgent = 'JSSDK/' + version;
	        return [userAgent, sdkUserAgent].join(';');
	      },
	      td_platform: function () {
	        // navigator.platform is recommended to using another way because of deprecated.
	        // Use navigator.userAgentData.platform instead.
	        return window.navigator.platform || window.navigator.userAgentData.platform;
	      },
	      td_host: function () {
	        return document.location.host;
	      },
	      td_path: function () {
	        return document.location.pathname;
	      },
	      td_referrer: function () {
	        return document.referrer;
	      }
	    }, track.values);
	  }
	  function configureTrack(track) {
	    return _.assign({
	      pageviews: 'pageviews',
	      events: 'events',
	      values: {}
	    }, track);
	  }
	  function configureStorage(storage) {
	    if (storage === 'none') {
	      return false;
	    }
	    storage = _.isObject(storage) ? storage : {};
	    return _.assign({
	      name: '_td',
	      expires: 63072000,
	      domain: document.location.hostname,
	      customDomain: !!storage.domain,
	      path: '/'
	    }, storage);
	  }
	  function getMeta(metaName) {
	    var head = document.head || document.getElementsByTagName('head')[0];
	    var metas = head.getElementsByTagName('meta');
	    var metaLength = metas.length;
	    for (var i = 0; i < metaLength; i++) {
	      if (metas[i].getAttribute('name') === metaName) {
	        return (metas[i].getAttribute('content') || '').substr(0, 8192);
	      }
	    }
	    return '';
	  }

	  /*
	   * @Treasure.configure
	   *
	   * @description The configure function takes a config object that configures how the library will work.
	   *
	   * @param    {object}        config                 - configuration object
	   * @property {object|string} config.storage         - when object it will overwrite defaults
	   * @property {string}        config.storage.name    - cookie name, defaults to _td
	   * @property {number}        config.storage.expires - cookie duration in seconds, when 0 no cookie gets set, defaults to 63072000 (2 years)
	   * @property {string}        config.storage.domain  - domain on which to set the cookie, defaults to document.location.hostname
	   * @property {object}        config.track           - tracking configuration object
	   * @property {string}        config.track.pageviews - default pageviews table name, defaults to 'pageviews'
	   * @property {string}        config.track.events    - default events table name, defaults to 'events'
	   *
	   */
	  track.configure = function configure(config) {
	    config = _.isObject(config) ? config : {};

	    // Object configuration for track and storage
	    this.client.track = config.track = configureTrack(config.track);
	    this.client.storage = config.storage = configureStorage(config.storage);

	    // If clientId is not set, check cookies
	    // If it's not set after checking cookies, generate a uuid and assign it
	    if (_.isNumber(config.clientId)) {
	      config.clientId = config.clientId.toString();
	    } else if (!config.clientId || !_.isString(config.clientId)) {
	      if (config.storage && config.storage.name) {
	        config.clientId = cookie.getItem(config.storage.name);
	      }
	      if (!config.clientId || config.clientId === 'undefined') {
	        config.clientId = generateUUID();
	      }
	    }
	    this.resetUUID(config.storage, config.clientId);
	    return this;
	  };

	  /**
	   * Reset the client's UUID, set to Treasure Data as {@link TD_CLIENT_ID} `td_client_id`.
	   * You can specify custom storage and custom client id.
	   * See Track/Storage parameters section for more information on storage's configuration
	   *
	   * @param {object} [suggestedStorage]  - custom storage configuration
	   * @param {string} [suggestedClientId] - custom client id
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.resetUUID() // set td_client_id as random uuid
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.resetUUID(
	   *   {
	   *     name: '_td', // cookie name
	   *     expires: 63072000,
	   *     domain: 'domain',
	   *     customDomain: true/false
	   *     path: '/'
	   *   },
	   *   'xxx-xxx-xxxx' // client id
	   * )
	   */
	  track.resetUUID = function resetUUID(suggestedStorage, suggestedClientId) {
	    var clientId = suggestedClientId || generateUUID();
	    var storage = suggestedStorage || this.client.storage;
	    // Remove any NULLs that might be present in the clientId
	    this.client.track.uuid = clientId.replace(/\0/g, '');

	    // Only save cookies if storage is enabled and expires is non-zero
	    // and client is in signed mode
	    if (storage) {
	      if (storage.expires && this.inSignedMode()) {
	        setCookie(storage, storage.name, undefined);
	        setCookie(storage, storage.name, this.client.track.uuid);
	      }
	    }

	    // Values must be initialized later because they depend on knowing the uuid
	    this.client.track.values = _.assign(configureValues(this.client.track), this.client.track.values);
	    return this;
	  };

	  /**
	   * Creates an empty object, applies all tracked information values, and applies record values. Then it calls addRecord with the newly created object.
	   *
	   * @param {string}   table     - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
	   * @param {string}   [record]  - Additional key-value pairs that get sent with the tracked values. These values overwrite default tracking values
	   * @param {function} [success] - Callback for when sending the event is successful
	   * @param {function} [failure] - Callback for when sending the event is unsuccessful
	   *
	   * @example
	   * var td = new Treasure({...});
	   *
	   * td.trackEvent('events');
	   * // Sends:
	   * // {
	   * //   "td_ip": "192.168.0.1",
	   * //   ...
	   * // }
	   *
	   *
	   * td.trackEvent('events', {td_ip: '0.0.0.0'});
	   * // Sends:
	   * // {
	   * //   "td_ip": "0.0.0.0",
	   * //   ...
	   * // }
	   *
	   */
	  track.trackEvent = function trackEvent(table, record, success, failure) {
	    // When no table, use default events table
	    if (!table) {
	      table = this.client.track.events;
	    }
	    record = _.assign(this.getTrackValues(), record);
	    this.addRecord(table, record, success, failure);
	    return this;
	  };

	  /**
	   * Helper function that calls trackEvent with an empty record.
	   * Track impressions on your website
	   * Will include location, page, and title
	   *
	   * Usage:
	   * Treasure#trackPageview() - Sets table to default track pageviews
	   * Treasure#trackPageview(table, success, failure)
	   *
	   * @param {string}   table     - table name, must be between 3 and 255 characters and must consist only of lower case letters, numbers, and _
	   * @param {function} [success] - Callback for when sending the event is successful
	   * @param {function} [error]   - Callback for when sending the event is unsuccessful
	   *
	   *
	   * @example
	   * var td = new Treasure({...});
	   * td.trackPageview('pageviews');
	   */
	  track.trackPageview = function trackPageview(table, success, failure) {
	    // When no table, use default pageviews table
	    if (!table) {
	      table = this.client.track.pageviews;
	    }
	    this.trackEvent(table, {}, success, failure);
	    return this;
	  };

	  /*
	   * Track.getTrackValues
	   *
	   * Returns an object which executes all track value functions
	   *
	   */
	  track.getTrackValues = function getTrackValues() {
	    var result = {};
	    _.forIn(this.client.track.values, function (value, key) {
	      if (value) {
	        result[key] = typeof value === 'function' ? value() : value;
	      }
	    });
	    return result;
	  };
	  return track;
	}

	/*
	 * Treasure Server Side Cookie
	 */
	var servercookie;
	var hasRequiredServercookie;
	function requireServercookie() {
	  if (hasRequiredServercookie) return servercookie;
	  hasRequiredServercookie = 1;
	  var noop = requireLodash().noop;
	  var cookie = requireJsCookies();
	  var setCookie = requireSetCookie();
	  var api = requireXhr();
	  var cookieName = '_td_ssc_id';
	  function configure() {
	    return this;
	  }

	  /**
	   * This functionality complies with ITP 1.2 tracking. Contact customer support for enabling this feature.
	   *
	   * @param {function} [success]    - Callback for when sending the event is successful
	   * @param {function} [error]      - Callback for when sending the event is unsuccessful
	   * @param {boolean}  [forceFetch] - Forces a refetch of server side id and ignores cached version (default false)
	   *
	   * @example
	   * var td = new Treasure({...})
	   * var successCallback = function (serverSideId) {
	   *   // celebrate();
	   * };
	   * var errorCallback = function (error) {
	   *   // cry();
	   * }
	   * td.fetchServerCookie(successCallback, errorCallback)
	   */
	  function fetchServerCookie(success, error, forceFetch) {
	    success = success || noop;
	    error = error || noop;
	    if (!this.inSignedMode()) {
	      return error('not in signed in mode');
	    }
	    if (!this.client.useServerSideCookie) {
	      return error('server side cookie not enabled');
	    }
	    if (!this._serverCookieDomainHost) {
	      if (typeof this.client.sscDomain === 'function') {
	        this._serverCookieDomain = this.client.sscDomain();
	      } else {
	        this._serverCookieDomain = this.client.sscDomain;
	      }
	      if (typeof this.client.sscServer === 'function') {
	        this._serverCookieDomainHost = this.client.sscServer(this._serverCookieDomain);
	      } else {
	        this._serverCookieDomainHost = this.client.sscServer;
	      }
	    }
	    var url = 'https://' + this._serverCookieDomainHost + '/get_cookie_id?cookie_domain=' + window.encodeURI(this._serverCookieDomain) + '&r=' + new Date().getTime();
	    var cachedSSCId = cookie.getItem(cookieName);
	    if (cachedSSCId && !forceFetch) {
	      return setTimeout(function () {
	        success(cachedSSCId);
	      }, 0);
	    }
	    api.get(url).then(function (res) {
	      success(res.td_ssc_id);
	    }).catch(error);
	  }
	  function removeServerCookie() {
	    // we try every possible case to remove the cookie.
	    if (Object.prototype.toString.call(this.client.sscDomain) === '[object Function]') {
	      var domainChunks = document.location.hostname.split('.');
	      if (domainChunks.length && domainChunks.length > 2) {
	        for (var i = domainChunks.length - 2; i >= 1; i--) {
	          var domain = domainChunks.slice(i).join('.');
	          setCookie({
	            domain: domain
	          }, cookieName);
	        }
	      } else {
	        setCookie({
	          domain: document.location.hostname
	        }, cookieName);
	      }
	    } else {
	      setCookie({
	        domain: this.client.sscDomain
	      }, cookieName);
	    }
	  }
	  servercookie = {
	    configure: configure,
	    fetchServerCookie: fetchServerCookie,
	    removeServerCookie: removeServerCookie
	  };
	  return servercookie;
	}

	var dayjs_min$1 = {exports: {}};

	var dayjs_min = dayjs_min$1.exports;
	var hasRequiredDayjs_min;
	function requireDayjs_min() {
	  if (hasRequiredDayjs_min) return dayjs_min$1.exports;
	  hasRequiredDayjs_min = 1;
	  (function (module, exports) {
	    !function (t, e) {
	      module.exports = e() ;
	    }(dayjs_min, function () {

	      var t = "millisecond",
	        e = "second",
	        n = "minute",
	        r = "hour",
	        i = "day",
	        s = "week",
	        u = "month",
	        a = "quarter",
	        o = "year",
	        f = "date",
	        h = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d+)?$/,
	        c = /\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
	        d = {
	          name: "en",
	          weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	          months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
	        },
	        $ = function (t, e, n) {
	          var r = String(t);
	          return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
	        },
	        l = {
	          s: $,
	          z: function (t) {
	            var e = -t.utcOffset(),
	              n = Math.abs(e),
	              r = Math.floor(n / 60),
	              i = n % 60;
	            return (e <= 0 ? "+" : "-") + $(r, 2, "0") + ":" + $(i, 2, "0");
	          },
	          m: function t(e, n) {
	            if (e.date() < n.date()) return -t(n, e);
	            var r = 12 * (n.year() - e.year()) + (n.month() - e.month()),
	              i = e.clone().add(r, u),
	              s = n - i < 0,
	              a = e.clone().add(r + (s ? -1 : 1), u);
	            return +(-(r + (n - i) / (s ? i - a : a - i)) || 0);
	          },
	          a: function (t) {
	            return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
	          },
	          p: function (h) {
	            return {
	              M: u,
	              y: o,
	              w: s,
	              d: i,
	              D: f,
	              h: r,
	              m: n,
	              s: e,
	              ms: t,
	              Q: a
	            }[h] || String(h || "").toLowerCase().replace(/s$/, "");
	          },
	          u: function (t) {
	            return void 0 === t;
	          }
	        },
	        y = "en",
	        M = {};
	      M[y] = d;
	      var m = function (t) {
	          return t instanceof S;
	        },
	        D = function (t, e, n) {
	          var r;
	          if (!t) return y;
	          if ("string" == typeof t) M[t] && (r = t), e && (M[t] = e, r = t);else {
	            var i = t.name;
	            M[i] = t, r = i;
	          }
	          return !n && r && (y = r), r || !n && y;
	        },
	        v = function (t, e) {
	          if (m(t)) return t.clone();
	          var n = "object" == typeof e ? e : {};
	          return n.date = t, n.args = arguments, new S(n);
	        },
	        g = l;
	      g.l = D, g.i = m, g.w = function (t, e) {
	        return v(t, {
	          locale: e.$L,
	          utc: e.$u,
	          x: e.$x,
	          $offset: e.$offset
	        });
	      };
	      var S = function () {
	          function d(t) {
	            this.$L = this.$L || D(t.locale, null, !0), this.parse(t);
	          }
	          var $ = d.prototype;
	          return $.parse = function (t) {
	            this.$d = function (t) {
	              var e = t.date,
	                n = t.utc;
	              if (null === e) return new Date(NaN);
	              if (g.u(e)) return new Date();
	              if (e instanceof Date) return new Date(e);
	              if ("string" == typeof e && !/Z$/i.test(e)) {
	                var r = e.match(h);
	                if (r) {
	                  var i = r[2] - 1 || 0,
	                    s = (r[7] || "0").substring(0, 3);
	                  return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
	                }
	              }
	              return new Date(e);
	            }(t), this.$x = t.x || {}, this.init();
	          }, $.init = function () {
	            var t = this.$d;
	            this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
	          }, $.$utils = function () {
	            return g;
	          }, $.isValid = function () {
	            return !("Invalid Date" === this.$d.toString());
	          }, $.isSame = function (t, e) {
	            var n = v(t);
	            return this.startOf(e) <= n && n <= this.endOf(e);
	          }, $.isAfter = function (t, e) {
	            return v(t) < this.startOf(e);
	          }, $.isBefore = function (t, e) {
	            return this.endOf(e) < v(t);
	          }, $.$g = function (t, e, n) {
	            return g.u(t) ? this[e] : this.set(n, t);
	          }, $.unix = function () {
	            return Math.floor(this.valueOf() / 1e3);
	          }, $.valueOf = function () {
	            return this.$d.getTime();
	          }, $.startOf = function (t, a) {
	            var h = this,
	              c = !!g.u(a) || a,
	              d = g.p(t),
	              $ = function (t, e) {
	                var n = g.w(h.$u ? Date.UTC(h.$y, e, t) : new Date(h.$y, e, t), h);
	                return c ? n : n.endOf(i);
	              },
	              l = function (t, e) {
	                return g.w(h.toDate()[t].apply(h.toDate("s"), (c ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e)), h);
	              },
	              y = this.$W,
	              M = this.$M,
	              m = this.$D,
	              D = "set" + (this.$u ? "UTC" : "");
	            switch (d) {
	              case o:
	                return c ? $(1, 0) : $(31, 11);
	              case u:
	                return c ? $(1, M) : $(0, M + 1);
	              case s:
	                var v = this.$locale().weekStart || 0,
	                  S = (y < v ? y + 7 : y) - v;
	                return $(c ? m - S : m + (6 - S), M);
	              case i:
	              case f:
	                return l(D + "Hours", 0);
	              case r:
	                return l(D + "Minutes", 1);
	              case n:
	                return l(D + "Seconds", 2);
	              case e:
	                return l(D + "Milliseconds", 3);
	              default:
	                return this.clone();
	            }
	          }, $.endOf = function (t) {
	            return this.startOf(t, !1);
	          }, $.$set = function (s, a) {
	            var h,
	              c = g.p(s),
	              d = "set" + (this.$u ? "UTC" : ""),
	              $ = (h = {}, h[i] = d + "Date", h[f] = d + "Date", h[u] = d + "Month", h[o] = d + "FullYear", h[r] = d + "Hours", h[n] = d + "Minutes", h[e] = d + "Seconds", h[t] = d + "Milliseconds", h)[c],
	              l = c === i ? this.$D + (a - this.$W) : a;
	            if (c === u || c === o) {
	              var y = this.clone().set(f, 1);
	              y.$d[$](l), y.init(), this.$d = y.set(f, Math.min(this.$D, y.daysInMonth())).$d;
	            } else $ && this.$d[$](l);
	            return this.init(), this;
	          }, $.set = function (t, e) {
	            return this.clone().$set(t, e);
	          }, $.get = function (t) {
	            return this[g.p(t)]();
	          }, $.add = function (t, a) {
	            var f,
	              h = this;
	            t = Number(t);
	            var c = g.p(a),
	              d = function (e) {
	                var n = v(h);
	                return g.w(n.date(n.date() + Math.round(e * t)), h);
	              };
	            if (c === u) return this.set(u, this.$M + t);
	            if (c === o) return this.set(o, this.$y + t);
	            if (c === i) return d(1);
	            if (c === s) return d(7);
	            var $ = (f = {}, f[n] = 6e4, f[r] = 36e5, f[e] = 1e3, f)[c] || 1,
	              l = this.$d.getTime() + t * $;
	            return g.w(l, this);
	          }, $.subtract = function (t, e) {
	            return this.add(-1 * t, e);
	          }, $.format = function (t) {
	            var e = this;
	            if (!this.isValid()) return "Invalid Date";
	            var n = t || "YYYY-MM-DDTHH:mm:ssZ",
	              r = g.z(this),
	              i = this.$locale(),
	              s = this.$H,
	              u = this.$m,
	              a = this.$M,
	              o = i.weekdays,
	              f = i.months,
	              h = function (t, r, i, s) {
	                return t && (t[r] || t(e, n)) || i[r].substr(0, s);
	              },
	              d = function (t) {
	                return g.s(s % 12 || 12, t, "0");
	              },
	              $ = i.meridiem || function (t, e, n) {
	                var r = t < 12 ? "AM" : "PM";
	                return n ? r.toLowerCase() : r;
	              },
	              l = {
	                YY: String(this.$y).slice(-2),
	                YYYY: this.$y,
	                M: a + 1,
	                MM: g.s(a + 1, 2, "0"),
	                MMM: h(i.monthsShort, a, f, 3),
	                MMMM: h(f, a),
	                D: this.$D,
	                DD: g.s(this.$D, 2, "0"),
	                d: String(this.$W),
	                dd: h(i.weekdaysMin, this.$W, o, 2),
	                ddd: h(i.weekdaysShort, this.$W, o, 3),
	                dddd: o[this.$W],
	                H: String(s),
	                HH: g.s(s, 2, "0"),
	                h: d(1),
	                hh: d(2),
	                a: $(s, u, !0),
	                A: $(s, u, !1),
	                m: String(u),
	                mm: g.s(u, 2, "0"),
	                s: String(this.$s),
	                ss: g.s(this.$s, 2, "0"),
	                SSS: g.s(this.$ms, 3, "0"),
	                Z: r
	              };
	            return n.replace(c, function (t, e) {
	              return e || l[t] || r.replace(":", "");
	            });
	          }, $.utcOffset = function () {
	            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
	          }, $.diff = function (t, f, h) {
	            var c,
	              d = g.p(f),
	              $ = v(t),
	              l = 6e4 * ($.utcOffset() - this.utcOffset()),
	              y = this - $,
	              M = g.m(this, $);
	            return M = (c = {}, c[o] = M / 12, c[u] = M, c[a] = M / 3, c[s] = (y - l) / 6048e5, c[i] = (y - l) / 864e5, c[r] = y / 36e5, c[n] = y / 6e4, c[e] = y / 1e3, c)[d] || y, h ? M : g.a(M);
	          }, $.daysInMonth = function () {
	            return this.endOf(u).$D;
	          }, $.$locale = function () {
	            return M[this.$L];
	          }, $.locale = function (t, e) {
	            if (!t) return this.$L;
	            var n = this.clone(),
	              r = D(t, e, !0);
	            return r && (n.$L = r), n;
	          }, $.clone = function () {
	            return g.w(this.$d, this);
	          }, $.toDate = function () {
	            return new Date(this.valueOf());
	          }, $.toJSON = function () {
	            return this.isValid() ? this.toISOString() : null;
	          }, $.toISOString = function () {
	            return this.$d.toISOString();
	          }, $.toString = function () {
	            return this.$d.toUTCString();
	          }, d;
	        }(),
	        p = S.prototype;
	      return v.prototype = p, [["$ms", t], ["$s", e], ["$m", n], ["$H", r], ["$W", i], ["$M", u], ["$y", o], ["$D", f]].forEach(function (t) {
	        p[t[1]] = function (e) {
	          return this.$g(e, t[0], t[1]);
	        };
	      }), v.extend = function (t, e) {
	        return t(e, S, v), v;
	      }, v.locale = D, v.isDayjs = m, v.unix = function (t) {
	        return v(1e3 * t);
	      }, v.en = M[y], v.Ls = M, v;
	    });
	  })(dayjs_min$1);
	  return dayjs_min$1.exports;
	}

	function commonjsRequire(path) {
		throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
	}

	var es6Promise$1 = {exports: {}};

	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   v4.2.8+1e68dce6
	 */
	var es6Promise = es6Promise$1.exports;
	var hasRequiredEs6Promise;
	function requireEs6Promise() {
	  if (hasRequiredEs6Promise) return es6Promise$1.exports;
	  hasRequiredEs6Promise = 1;
	  (function (module, exports) {
	    (function (global, factory) {
	      module.exports = factory() ;
	    })(es6Promise, function () {

	      function objectOrFunction(x) {
	        var type = typeof x;
	        return x !== null && (type === 'object' || type === 'function');
	      }
	      function isFunction(x) {
	        return typeof x === 'function';
	      }
	      var _isArray = void 0;
	      if (Array.isArray) {
	        _isArray = Array.isArray;
	      } else {
	        _isArray = function (x) {
	          return Object.prototype.toString.call(x) === '[object Array]';
	        };
	      }
	      var isArray = _isArray;
	      var len = 0;
	      var vertxNext = void 0;
	      var customSchedulerFn = void 0;
	      var asap = function asap(callback, arg) {
	        queue[len] = callback;
	        queue[len + 1] = arg;
	        len += 2;
	        if (len === 2) {
	          // If len is 2, that means that we need to schedule an async flush.
	          // If additional callbacks are queued before the queue is flushed, they
	          // will be processed by this flush that we are scheduling.
	          if (customSchedulerFn) {
	            customSchedulerFn(flush);
	          } else {
	            scheduleFlush();
	          }
	        }
	      };
	      function setScheduler(scheduleFn) {
	        customSchedulerFn = scheduleFn;
	      }
	      function setAsap(asapFn) {
	        asap = asapFn;
	      }
	      var browserWindow = typeof window !== 'undefined' ? window : undefined;
	      var browserGlobal = browserWindow || {};
	      var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	      var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	      // test for web worker but not in IE10
	      var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	      // node
	      function useNextTick() {
	        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	        // see https://github.com/cujojs/when/issues/410 for details
	        return function () {
	          return process.nextTick(flush);
	        };
	      }

	      // vertx
	      function useVertxTimer() {
	        if (typeof vertxNext !== 'undefined') {
	          return function () {
	            vertxNext(flush);
	          };
	        }
	        return useSetTimeout();
	      }
	      function useMutationObserver() {
	        var iterations = 0;
	        var observer = new BrowserMutationObserver(flush);
	        var node = document.createTextNode('');
	        observer.observe(node, {
	          characterData: true
	        });
	        return function () {
	          node.data = iterations = ++iterations % 2;
	        };
	      }

	      // web worker
	      function useMessageChannel() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = flush;
	        return function () {
	          return channel.port2.postMessage(0);
	        };
	      }
	      function useSetTimeout() {
	        // Store setTimeout reference so es6-promise will be unaffected by
	        // other code modifying setTimeout (like sinon.useFakeTimers())
	        var globalSetTimeout = setTimeout;
	        return function () {
	          return globalSetTimeout(flush, 1);
	        };
	      }
	      var queue = new Array(1000);
	      function flush() {
	        for (var i = 0; i < len; i += 2) {
	          var callback = queue[i];
	          var arg = queue[i + 1];
	          callback(arg);
	          queue[i] = undefined;
	          queue[i + 1] = undefined;
	        }
	        len = 0;
	      }
	      function attemptVertx() {
	        try {
	          var vertx = Function('return this')().require('vertx');
	          vertxNext = vertx.runOnLoop || vertx.runOnContext;
	          return useVertxTimer();
	        } catch (e) {
	          return useSetTimeout();
	        }
	      }
	      var scheduleFlush = void 0;
	      // Decide what async method to use to triggering processing of queued callbacks:
	      if (isNode) {
	        scheduleFlush = useNextTick();
	      } else if (BrowserMutationObserver) {
	        scheduleFlush = useMutationObserver();
	      } else if (isWorker) {
	        scheduleFlush = useMessageChannel();
	      } else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
	        scheduleFlush = attemptVertx();
	      } else {
	        scheduleFlush = useSetTimeout();
	      }
	      function then(onFulfillment, onRejection) {
	        var parent = this;
	        var child = new this.constructor(noop);
	        if (child[PROMISE_ID] === undefined) {
	          makePromise(child);
	        }
	        var _state = parent._state;
	        if (_state) {
	          var callback = arguments[_state - 1];
	          asap(function () {
	            return invokeCallback(_state, child, callback, parent._result);
	          });
	        } else {
	          subscribe(parent, child, onFulfillment, onRejection);
	        }
	        return child;
	      }

	      /**
	        `Promise.resolve` returns a promise that will become resolved with the
	        passed `value`. It is shorthand for the following:
	      	  ```javascript
	        let promise = new Promise(function(resolve, reject){
	          resolve(1);
	        });
	      	  promise.then(function(value){
	          // value === 1
	        });
	        ```
	      	  Instead of writing the above, your code now simply becomes the following:
	      	  ```javascript
	        let promise = Promise.resolve(1);
	      	  promise.then(function(value){
	          // value === 1
	        });
	        ```
	      	  @method resolve
	        @static
	        @param {Any} value value that the returned promise will be resolved with
	        Useful for tooling.
	        @return {Promise} a promise that will become fulfilled with the given
	        `value`
	      */
	      function resolve$1(object) {
	        /*jshint validthis:true */
	        var Constructor = this;
	        if (object && typeof object === 'object' && object.constructor === Constructor) {
	          return object;
	        }
	        var promise = new Constructor(noop);
	        resolve(promise, object);
	        return promise;
	      }
	      var PROMISE_ID = Math.random().toString(36).substring(2);
	      function noop() {}
	      var PENDING = void 0;
	      var FULFILLED = 1;
	      var REJECTED = 2;
	      function selfFulfillment() {
	        return new TypeError("You cannot resolve a promise with itself");
	      }
	      function cannotReturnOwn() {
	        return new TypeError('A promises callback cannot return that same promise.');
	      }
	      function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
	        try {
	          then$$1.call(value, fulfillmentHandler, rejectionHandler);
	        } catch (e) {
	          return e;
	        }
	      }
	      function handleForeignThenable(promise, thenable, then$$1) {
	        asap(function (promise) {
	          var sealed = false;
	          var error = tryThen(then$$1, thenable, function (value) {
	            if (sealed) {
	              return;
	            }
	            sealed = true;
	            if (thenable !== value) {
	              resolve(promise, value);
	            } else {
	              fulfill(promise, value);
	            }
	          }, function (reason) {
	            if (sealed) {
	              return;
	            }
	            sealed = true;
	            reject(promise, reason);
	          }, 'Settle: ' + (promise._label || ' unknown promise'));
	          if (!sealed && error) {
	            sealed = true;
	            reject(promise, error);
	          }
	        }, promise);
	      }
	      function handleOwnThenable(promise, thenable) {
	        if (thenable._state === FULFILLED) {
	          fulfill(promise, thenable._result);
	        } else if (thenable._state === REJECTED) {
	          reject(promise, thenable._result);
	        } else {
	          subscribe(thenable, undefined, function (value) {
	            return resolve(promise, value);
	          }, function (reason) {
	            return reject(promise, reason);
	          });
	        }
	      }
	      function handleMaybeThenable(promise, maybeThenable, then$$1) {
	        if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
	          handleOwnThenable(promise, maybeThenable);
	        } else {
	          if (then$$1 === undefined) {
	            fulfill(promise, maybeThenable);
	          } else if (isFunction(then$$1)) {
	            handleForeignThenable(promise, maybeThenable, then$$1);
	          } else {
	            fulfill(promise, maybeThenable);
	          }
	        }
	      }
	      function resolve(promise, value) {
	        if (promise === value) {
	          reject(promise, selfFulfillment());
	        } else if (objectOrFunction(value)) {
	          var then$$1 = void 0;
	          try {
	            then$$1 = value.then;
	          } catch (error) {
	            reject(promise, error);
	            return;
	          }
	          handleMaybeThenable(promise, value, then$$1);
	        } else {
	          fulfill(promise, value);
	        }
	      }
	      function publishRejection(promise) {
	        if (promise._onerror) {
	          promise._onerror(promise._result);
	        }
	        publish(promise);
	      }
	      function fulfill(promise, value) {
	        if (promise._state !== PENDING) {
	          return;
	        }
	        promise._result = value;
	        promise._state = FULFILLED;
	        if (promise._subscribers.length !== 0) {
	          asap(publish, promise);
	        }
	      }
	      function reject(promise, reason) {
	        if (promise._state !== PENDING) {
	          return;
	        }
	        promise._state = REJECTED;
	        promise._result = reason;
	        asap(publishRejection, promise);
	      }
	      function subscribe(parent, child, onFulfillment, onRejection) {
	        var _subscribers = parent._subscribers;
	        var length = _subscribers.length;
	        parent._onerror = null;
	        _subscribers[length] = child;
	        _subscribers[length + FULFILLED] = onFulfillment;
	        _subscribers[length + REJECTED] = onRejection;
	        if (length === 0 && parent._state) {
	          asap(publish, parent);
	        }
	      }
	      function publish(promise) {
	        var subscribers = promise._subscribers;
	        var settled = promise._state;
	        if (subscribers.length === 0) {
	          return;
	        }
	        var child = void 0,
	          callback = void 0,
	          detail = promise._result;
	        for (var i = 0; i < subscribers.length; i += 3) {
	          child = subscribers[i];
	          callback = subscribers[i + settled];
	          if (child) {
	            invokeCallback(settled, child, callback, detail);
	          } else {
	            callback(detail);
	          }
	        }
	        promise._subscribers.length = 0;
	      }
	      function invokeCallback(settled, promise, callback, detail) {
	        var hasCallback = isFunction(callback),
	          value = void 0,
	          error = void 0,
	          succeeded = true;
	        if (hasCallback) {
	          try {
	            value = callback(detail);
	          } catch (e) {
	            succeeded = false;
	            error = e;
	          }
	          if (promise === value) {
	            reject(promise, cannotReturnOwn());
	            return;
	          }
	        } else {
	          value = detail;
	        }
	        if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
	          resolve(promise, value);
	        } else if (succeeded === false) {
	          reject(promise, error);
	        } else if (settled === FULFILLED) {
	          fulfill(promise, value);
	        } else if (settled === REJECTED) {
	          reject(promise, value);
	        }
	      }
	      function initializePromise(promise, resolver) {
	        try {
	          resolver(function resolvePromise(value) {
	            resolve(promise, value);
	          }, function rejectPromise(reason) {
	            reject(promise, reason);
	          });
	        } catch (e) {
	          reject(promise, e);
	        }
	      }
	      var id = 0;
	      function nextId() {
	        return id++;
	      }
	      function makePromise(promise) {
	        promise[PROMISE_ID] = id++;
	        promise._state = undefined;
	        promise._result = undefined;
	        promise._subscribers = [];
	      }
	      function validationError() {
	        return new Error('Array Methods must be provided an Array');
	      }
	      var Enumerator = function () {
	        function Enumerator(Constructor, input) {
	          this._instanceConstructor = Constructor;
	          this.promise = new Constructor(noop);
	          if (!this.promise[PROMISE_ID]) {
	            makePromise(this.promise);
	          }
	          if (isArray(input)) {
	            this.length = input.length;
	            this._remaining = input.length;
	            this._result = new Array(this.length);
	            if (this.length === 0) {
	              fulfill(this.promise, this._result);
	            } else {
	              this.length = this.length || 0;
	              this._enumerate(input);
	              if (this._remaining === 0) {
	                fulfill(this.promise, this._result);
	              }
	            }
	          } else {
	            reject(this.promise, validationError());
	          }
	        }
	        Enumerator.prototype._enumerate = function _enumerate(input) {
	          for (var i = 0; this._state === PENDING && i < input.length; i++) {
	            this._eachEntry(input[i], i);
	          }
	        };
	        Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
	          var c = this._instanceConstructor;
	          var resolve$$1 = c.resolve;
	          if (resolve$$1 === resolve$1) {
	            var _then = void 0;
	            var error = void 0;
	            var didError = false;
	            try {
	              _then = entry.then;
	            } catch (e) {
	              didError = true;
	              error = e;
	            }
	            if (_then === then && entry._state !== PENDING) {
	              this._settledAt(entry._state, i, entry._result);
	            } else if (typeof _then !== 'function') {
	              this._remaining--;
	              this._result[i] = entry;
	            } else if (c === Promise$1) {
	              var promise = new c(noop);
	              if (didError) {
	                reject(promise, error);
	              } else {
	                handleMaybeThenable(promise, entry, _then);
	              }
	              this._willSettleAt(promise, i);
	            } else {
	              this._willSettleAt(new c(function (resolve$$1) {
	                return resolve$$1(entry);
	              }), i);
	            }
	          } else {
	            this._willSettleAt(resolve$$1(entry), i);
	          }
	        };
	        Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
	          var promise = this.promise;
	          if (promise._state === PENDING) {
	            this._remaining--;
	            if (state === REJECTED) {
	              reject(promise, value);
	            } else {
	              this._result[i] = value;
	            }
	          }
	          if (this._remaining === 0) {
	            fulfill(promise, this._result);
	          }
	        };
	        Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
	          var enumerator = this;
	          subscribe(promise, undefined, function (value) {
	            return enumerator._settledAt(FULFILLED, i, value);
	          }, function (reason) {
	            return enumerator._settledAt(REJECTED, i, reason);
	          });
	        };
	        return Enumerator;
	      }();

	      /**
	        `Promise.all` accepts an array of promises, and returns a new promise which
	        is fulfilled with an array of fulfillment values for the passed promises, or
	        rejected with the reason of the first passed promise to be rejected. It casts all
	        elements of the passed iterable to promises as it runs this algorithm.
	      	  Example:
	      	  ```javascript
	        let promise1 = resolve(1);
	        let promise2 = resolve(2);
	        let promise3 = resolve(3);
	        let promises = [ promise1, promise2, promise3 ];
	      	  Promise.all(promises).then(function(array){
	          // The array here would be [ 1, 2, 3 ];
	        });
	        ```
	      	  If any of the `promises` given to `all` are rejected, the first promise
	        that is rejected will be given as an argument to the returned promises's
	        rejection handler. For example:
	      	  Example:
	      	  ```javascript
	        let promise1 = resolve(1);
	        let promise2 = reject(new Error("2"));
	        let promise3 = reject(new Error("3"));
	        let promises = [ promise1, promise2, promise3 ];
	      	  Promise.all(promises).then(function(array){
	          // Code here never runs because there are rejected promises!
	        }, function(error) {
	          // error.message === "2"
	        });
	        ```
	      	  @method all
	        @static
	        @param {Array} entries array of promises
	        @param {String} label optional string for labeling the promise.
	        Useful for tooling.
	        @return {Promise} promise that is fulfilled when all `promises` have been
	        fulfilled, or rejected if any of them become rejected.
	        @static
	      */
	      function all(entries) {
	        return new Enumerator(this, entries).promise;
	      }

	      /**
	        `Promise.race` returns a new promise which is settled in the same way as the
	        first passed promise to settle.
	      	  Example:
	      	  ```javascript
	        let promise1 = new Promise(function(resolve, reject){
	          setTimeout(function(){
	            resolve('promise 1');
	          }, 200);
	        });
	      	  let promise2 = new Promise(function(resolve, reject){
	          setTimeout(function(){
	            resolve('promise 2');
	          }, 100);
	        });
	      	  Promise.race([promise1, promise2]).then(function(result){
	          // result === 'promise 2' because it was resolved before promise1
	          // was resolved.
	        });
	        ```
	      	  `Promise.race` is deterministic in that only the state of the first
	        settled promise matters. For example, even if other promises given to the
	        `promises` array argument are resolved, but the first settled promise has
	        become rejected before the other promises became fulfilled, the returned
	        promise will become rejected:
	      	  ```javascript
	        let promise1 = new Promise(function(resolve, reject){
	          setTimeout(function(){
	            resolve('promise 1');
	          }, 200);
	        });
	      	  let promise2 = new Promise(function(resolve, reject){
	          setTimeout(function(){
	            reject(new Error('promise 2'));
	          }, 100);
	        });
	      	  Promise.race([promise1, promise2]).then(function(result){
	          // Code here never runs
	        }, function(reason){
	          // reason.message === 'promise 2' because promise 2 became rejected before
	          // promise 1 became fulfilled
	        });
	        ```
	      	  An example real-world use case is implementing timeouts:
	      	  ```javascript
	        Promise.race([ajax('foo.json'), timeout(5000)])
	        ```
	      	  @method race
	        @static
	        @param {Array} promises array of promises to observe
	        Useful for tooling.
	        @return {Promise} a promise which settles in the same way as the first passed
	        promise to settle.
	      */
	      function race(entries) {
	        /*jshint validthis:true */
	        var Constructor = this;
	        if (!isArray(entries)) {
	          return new Constructor(function (_, reject) {
	            return reject(new TypeError('You must pass an array to race.'));
	          });
	        } else {
	          return new Constructor(function (resolve, reject) {
	            var length = entries.length;
	            for (var i = 0; i < length; i++) {
	              Constructor.resolve(entries[i]).then(resolve, reject);
	            }
	          });
	        }
	      }

	      /**
	        `Promise.reject` returns a promise rejected with the passed `reason`.
	        It is shorthand for the following:
	      	  ```javascript
	        let promise = new Promise(function(resolve, reject){
	          reject(new Error('WHOOPS'));
	        });
	      	  promise.then(function(value){
	          // Code here doesn't run because the promise is rejected!
	        }, function(reason){
	          // reason.message === 'WHOOPS'
	        });
	        ```
	      	  Instead of writing the above, your code now simply becomes the following:
	      	  ```javascript
	        let promise = Promise.reject(new Error('WHOOPS'));
	      	  promise.then(function(value){
	          // Code here doesn't run because the promise is rejected!
	        }, function(reason){
	          // reason.message === 'WHOOPS'
	        });
	        ```
	      	  @method reject
	        @static
	        @param {Any} reason value that the returned promise will be rejected with.
	        Useful for tooling.
	        @return {Promise} a promise rejected with the given `reason`.
	      */
	      function reject$1(reason) {
	        /*jshint validthis:true */
	        var Constructor = this;
	        var promise = new Constructor(noop);
	        reject(promise, reason);
	        return promise;
	      }
	      function needsResolver() {
	        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	      }
	      function needsNew() {
	        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	      }

	      /**
	        Promise objects represent the eventual result of an asynchronous operation. The
	        primary way of interacting with a promise is through its `then` method, which
	        registers callbacks to receive either a promise's eventual value or the reason
	        why the promise cannot be fulfilled.
	      	  Terminology
	        -----------
	      	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	        - `thenable` is an object or function that defines a `then` method.
	        - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	        - `exception` is a value that is thrown using the throw statement.
	        - `reason` is a value that indicates why a promise was rejected.
	        - `settled` the final resting state of a promise, fulfilled or rejected.
	      	  A promise can be in one of three states: pending, fulfilled, or rejected.
	      	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	        state.  Promises that are rejected have a rejection reason and are in the
	        rejected state.  A fulfillment value is never a thenable.
	      	  Promises can also be said to *resolve* a value.  If this value is also a
	        promise, then the original promise's settled state will match the value's
	        settled state.  So a promise that *resolves* a promise that rejects will
	        itself reject, and a promise that *resolves* a promise that fulfills will
	        itself fulfill.
	      		  Basic Usage:
	        ------------
	      	  ```js
	        let promise = new Promise(function(resolve, reject) {
	          // on success
	          resolve(value);
	      	    // on failure
	          reject(reason);
	        });
	      	  promise.then(function(value) {
	          // on fulfillment
	        }, function(reason) {
	          // on rejection
	        });
	        ```
	      	  Advanced Usage:
	        ---------------
	      	  Promises shine when abstracting away asynchronous interactions such as
	        `XMLHttpRequest`s.
	      	  ```js
	        function getJSON(url) {
	          return new Promise(function(resolve, reject){
	            let xhr = new XMLHttpRequest();
	      	      xhr.open('GET', url);
	            xhr.onreadystatechange = handler;
	            xhr.responseType = 'json';
	            xhr.setRequestHeader('Accept', 'application/json');
	            xhr.send();
	      	      function handler() {
	              if (this.readyState === this.DONE) {
	                if (this.status === 200) {
	                  resolve(this.response);
	                } else {
	                  reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	                }
	              }
	            };
	          });
	        }
	      	  getJSON('/posts.json').then(function(json) {
	          // on fulfillment
	        }, function(reason) {
	          // on rejection
	        });
	        ```
	      	  Unlike callbacks, promises are great composable primitives.
	      	  ```js
	        Promise.all([
	          getJSON('/posts'),
	          getJSON('/comments')
	        ]).then(function(values){
	          values[0] // => postsJSON
	          values[1] // => commentsJSON
	      	    return values;
	        });
	        ```
	      	  @class Promise
	        @param {Function} resolver
	        Useful for tooling.
	        @constructor
	      */

	      var Promise$1 = function () {
	        function Promise(resolver) {
	          this[PROMISE_ID] = nextId();
	          this._result = this._state = undefined;
	          this._subscribers = [];
	          if (noop !== resolver) {
	            typeof resolver !== 'function' && needsResolver();
	            this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	          }
	        }

	        /**
	        The primary way of interacting with a promise is through its `then` method,
	        which registers callbacks to receive either a promise's eventual value or the
	        reason why the promise cannot be fulfilled.
	         ```js
	        findUser().then(function(user){
	          // user is available
	        }, function(reason){
	          // user is unavailable, and you are given the reason why
	        });
	        ```
	         Chaining
	        --------
	         The return value of `then` is itself a promise.  This second, 'downstream'
	        promise is resolved with the return value of the first promise's fulfillment
	        or rejection handler, or rejected if the handler throws an exception.
	         ```js
	        findUser().then(function (user) {
	          return user.name;
	        }, function (reason) {
	          return 'default name';
	        }).then(function (userName) {
	          // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	          // will be `'default name'`
	        });
	         findUser().then(function (user) {
	          throw new Error('Found user, but still unhappy');
	        }, function (reason) {
	          throw new Error('`findUser` rejected and we're unhappy');
	        }).then(function (value) {
	          // never reached
	        }, function (reason) {
	          // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	          // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	        });
	        ```
	        If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	         ```js
	        findUser().then(function (user) {
	          throw new PedagogicalException('Upstream error');
	        }).then(function (value) {
	          // never reached
	        }).then(function (value) {
	          // never reached
	        }, function (reason) {
	          // The `PedgagocialException` is propagated all the way down to here
	        });
	        ```
	         Assimilation
	        ------------
	         Sometimes the value you want to propagate to a downstream promise can only be
	        retrieved asynchronously. This can be achieved by returning a promise in the
	        fulfillment or rejection handler. The downstream promise will then be pending
	        until the returned promise is settled. This is called *assimilation*.
	         ```js
	        findUser().then(function (user) {
	          return findCommentsByAuthor(user);
	        }).then(function (comments) {
	          // The user's comments are now available
	        });
	        ```
	         If the assimliated promise rejects, then the downstream promise will also reject.
	         ```js
	        findUser().then(function (user) {
	          return findCommentsByAuthor(user);
	        }).then(function (comments) {
	          // If `findCommentsByAuthor` fulfills, we'll have the value here
	        }, function (reason) {
	          // If `findCommentsByAuthor` rejects, we'll have the reason here
	        });
	        ```
	         Simple Example
	        --------------
	         Synchronous Example
	         ```javascript
	        let result;
	         try {
	          result = findResult();
	          // success
	        } catch(reason) {
	          // failure
	        }
	        ```
	         Errback Example
	         ```js
	        findResult(function(result, err){
	          if (err) {
	            // failure
	          } else {
	            // success
	          }
	        });
	        ```
	         Promise Example;
	         ```javascript
	        findResult().then(function(result){
	          // success
	        }, function(reason){
	          // failure
	        });
	        ```
	         Advanced Example
	        --------------
	         Synchronous Example
	         ```javascript
	        let author, books;
	         try {
	          author = findAuthor();
	          books  = findBooksByAuthor(author);
	          // success
	        } catch(reason) {
	          // failure
	        }
	        ```
	         Errback Example
	         ```js
	         function foundBooks(books) {
	         }
	         function failure(reason) {
	         }
	         findAuthor(function(author, err){
	          if (err) {
	            failure(err);
	            // failure
	          } else {
	            try {
	              findBoooksByAuthor(author, function(books, err) {
	                if (err) {
	                  failure(err);
	                } else {
	                  try {
	                    foundBooks(books);
	                  } catch(reason) {
	                    failure(reason);
	                  }
	                }
	              });
	            } catch(error) {
	              failure(err);
	            }
	            // success
	          }
	        });
	        ```
	         Promise Example;
	         ```javascript
	        findAuthor().
	          then(findBooksByAuthor).
	          then(function(books){
	            // found books
	        }).catch(function(reason){
	          // something went wrong
	        });
	        ```
	         @method then
	        @param {Function} onFulfilled
	        @param {Function} onRejected
	        Useful for tooling.
	        @return {Promise}
	        */

	        /**
	        `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	        as the catch block of a try/catch statement.
	        ```js
	        function findAuthor(){
	        throw new Error('couldn't find that author');
	        }
	        // synchronous
	        try {
	        findAuthor();
	        } catch(reason) {
	        // something went wrong
	        }
	        // async with promises
	        findAuthor().catch(function(reason){
	        // something went wrong
	        });
	        ```
	        @method catch
	        @param {Function} onRejection
	        Useful for tooling.
	        @return {Promise}
	        */

	        Promise.prototype.catch = function _catch(onRejection) {
	          return this.then(null, onRejection);
	        };

	        /**
	          `finally` will be invoked regardless of the promise's fate just as native
	          try/catch/finally behaves
	        
	          Synchronous example:
	        
	          ```js
	          findAuthor() {
	            if (Math.random() > 0.5) {
	              throw new Error();
	            }
	            return new Author();
	          }
	        
	          try {
	            return findAuthor(); // succeed or fail
	          } catch(error) {
	            return findOtherAuther();
	          } finally {
	            // always runs
	            // doesn't affect the return value
	          }
	          ```
	        
	          Asynchronous example:
	        
	          ```js
	          findAuthor().catch(function(reason){
	            return findOtherAuther();
	          }).finally(function(){
	            // author was either found, or not
	          });
	          ```
	        
	          @method finally
	          @param {Function} callback
	          @return {Promise}
	        */

	        Promise.prototype.finally = function _finally(callback) {
	          var promise = this;
	          var constructor = promise.constructor;
	          if (isFunction(callback)) {
	            return promise.then(function (value) {
	              return constructor.resolve(callback()).then(function () {
	                return value;
	              });
	            }, function (reason) {
	              return constructor.resolve(callback()).then(function () {
	                throw reason;
	              });
	            });
	          }
	          return promise.then(callback, callback);
	        };
	        return Promise;
	      }();
	      Promise$1.prototype.then = then;
	      Promise$1.all = all;
	      Promise$1.race = race;
	      Promise$1.resolve = resolve$1;
	      Promise$1.reject = reject$1;
	      Promise$1._setScheduler = setScheduler;
	      Promise$1._setAsap = setAsap;
	      Promise$1._asap = asap;

	      /*global self*/
	      function polyfill() {
	        var local = void 0;
	        if (typeof commonjsGlobal !== 'undefined') {
	          local = commonjsGlobal;
	        } else if (typeof self !== 'undefined') {
	          local = self;
	        } else {
	          try {
	            local = Function('return this')();
	          } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	        }
	        var P = local.Promise;
	        if (P) {
	          var promiseToString = null;
	          try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	          } catch (e) {
	            // silently ignored
	          }
	          if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	          }
	        }
	        local.Promise = Promise$1;
	      }

	      // Strange compat..
	      Promise$1.polyfill = polyfill;
	      Promise$1.Promise = Promise$1;
	      return Promise$1;
	    });
	  })(es6Promise$1);
	  return es6Promise$1.exports;
	}

	var consentManager;
	var hasRequiredConsentManager;
	function requireConsentManager() {
	  if (hasRequiredConsentManager) return consentManager;
	  hasRequiredConsentManager = 1;
	  var _ = requireLodash();
	  var dayjs = requireDayjs_min();
	  var global = requireWindow();
	  var generateUUID = requireGenerateUUID();
	  var misc = requireMisc();
	  var promisePolyfill = requireEs6Promise();
	  var camelCase = misc.camelCase;
	  var isLocalStorageAccessible = misc.isLocalStorageAccessible;
	  promisePolyfill.polyfill();
	  const STORAGE_KEY = 'td_consent_preferences';
	  const DEFAULT_CONSENT_TABLE = 'td_cm_consent';
	  const DEFAULT_CONTEXT_TABLE = 'td_cm_context';
	  const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
	  const DEFAULT_ISSUER = 'treasuredata';
	  const CONSENT_STATES = {
	    GIVEN: 'given',
	    REFUSED: 'refused',
	    NOTGIVEN: 'notgiven',
	    EXPIRED: 'expired'
	  };

	  // 'finally' polyfill for Edge 15
	  /* eslint-disable */
	  Promise.prototype.finally = Promise.prototype.finally || {
	    finally(fn) {
	      const onFinally = callback => Promise.resolve(fn()).then(callback);
	      return this.then(result => onFinally(() => result), reason => onFinally(() => Promise.reject(reason)));
	    }
	  }.finally;
	  /* eslint-enable */

	  consentManager = {
	    // setup consent manager
	    configure(options = {}) {
	      const consentManager = options.consentManager || {};
	      const hostname = document.location.hostname;
	      const {
	        storageKey = STORAGE_KEY,
	        consentTable = DEFAULT_CONSENT_TABLE,
	        contextTable = DEFAULT_CONTEXT_TABLE,
	        successConsentCallback = _.noop,
	        failureConsentCallback = _.noop,
	        expiredConsentsCallback = _.noop,
	        dateFormat = DEFAULT_DATE_FORMAT,
	        issuer = DEFAULT_ISSUER,
	        container
	      } = consentManager;
	      this.defaultContext = {
	        brand: hostname,
	        domain_name: hostname,
	        collection_type: hostname,
	        collection_point_id: hostname,
	        context_id: generateUUID(),
	        consents: {}
	      };
	      this.consentManager = {
	        storageKey,
	        successConsentCallback,
	        failureConsentCallback,
	        expiredConsentsCallback,
	        consentTable,
	        contextTable,
	        dateFormat,
	        issuer,
	        container,
	        states: {
	          ...CONSENT_STATES
	        }
	      };
	      this.consentManager.preferences = this.getPreferences() || {};
	      this._updateExpiredConsents();
	      this.consentManager.expiredConsentsCallback(this.getExpiredConsents());
	    },
	    _getContainer(selector) {
	      if (_.isString(selector)) {
	        return document.querySelector(selector);
	      } else if (_.isObject(selector)) {
	        return selector;
	      }
	      return document.body;
	    },
	    _getNormalizedConsent(consentKey, consent) {
	      return {
	        description: consent.description,
	        datatype: consent.datatype,
	        status: consent.status,
	        expiry_date: consent.expiry_date || null,
	        issuer: this.consentManager.issuer,
	        identifier: this.client.track.uuid,
	        purpose: consentKey,
	        context_id: consent.context_id
	      };
	    },
	    _normalizeConsents() {
	      var updatedConsents = {};
	      var notUdpatedConsents = {};
	      for (const contextId in this.consentManager.preferences) {
	        const currentContext = this.consentManager.preferences[contextId];
	        for (const consentKey in currentContext.consents) {
	          const currentConsent = currentContext.consents[consentKey];
	          if (currentConsent._updated) {
	            updatedConsents[consentKey] = this._getNormalizedConsent(consentKey, currentConsent);
	          } else {
	            notUdpatedConsents[consentKey] = this._getNormalizedConsent(consentKey, currentConsent);
	          }
	        }
	      }
	      return _.isEmpty(updatedConsents) ? notUdpatedConsents : updatedConsents;
	    },
	    _stringifyPreferences() {
	      const clonedPreferences = _.cloneDeep(this.consentManager.preferences);
	      for (const contextId in clonedPreferences) {
	        const currentContext = clonedPreferences[contextId];
	        const consents = currentContext.consents;
	        for (const purpose in consents) {
	          const expiryDate = consents[purpose].expiry_date;
	          if (!_.isEmpty(expiryDate)) {
	            consents[purpose].expiry_date = dayjs(expiryDate).format(this.consentManager.dateFormat);
	          }
	          consents[purpose].identifier = this.client.track.uuid;
	          consents[purpose] = _.omit(consents[purpose], ['_updated']);
	        }
	      }
	      return JSON.stringify(clonedPreferences);
	    },
	    _isValidStatus(status) {
	      if (!status || !_.isString(status)) return false;
	      status = status.toLowerCase();
	      return status === CONSENT_STATES.GIVEN || status === CONSENT_STATES.REFUSED || status === CONSENT_STATES.NOTGIVEN || status === CONSENT_STATES.EXPIRED;
	    },
	    _isExpired(consent) {
	      const today = new Date();
	      return consent.status === CONSENT_STATES.GIVEN && consent.expiry_date && dayjs(consent.expiry_date).isBefore(dayjs(today));
	    },
	    _updateExpiredConsents() {
	      var shouldSaveConsents = false;
	      if (!_.isEmpty(this.consentManager.preferences)) {
	        for (const contextId in this.consentManager.preferences) {
	          const consents = this.consentManager.preferences[contextId].consents || {};
	          for (const purpose in consents) {
	            const consent = consents[purpose];
	            if (this._isExpired(consent)) {
	              consent.status = CONSENT_STATES.EXPIRED;
	              consent._updated = true;
	              shouldSaveConsents = true;
	            }
	          }
	        }
	      }
	      shouldSaveConsents && this.saveConsents(_.noop, _.noop);
	    },
	    getPreferences() {
	      if (!isLocalStorageAccessible()) return null;
	      const persistedPreferences = JSON.parse(global.localStorage.getItem(this.consentManager.storageKey)) || null;
	      if (persistedPreferences) {
	        for (const contextId in persistedPreferences) {
	          const consents = persistedPreferences[contextId].consents;
	          for (const purpose in consents) {
	            const expiryDate = consents[purpose].expiry_date;
	            if (!_.isEmpty(expiryDate)) {
	              consents[purpose].expiry_date = dayjs(expiryDate, this.consentManager.dateFormat).valueOf();
	            }
	            consents[purpose].identifier = this.client.track.uuid;
	          }
	        }
	      }
	      return persistedPreferences;
	    },
	    _savePreferences() {
	      if (!isLocalStorageAccessible() || _.isEmpty(this.consentManager.preferences)) return;
	      global.localStorage.setItem(this.consentManager.storageKey, this._stringifyPreferences());
	    },
	    _getPromise(consent) {
	      return new Promise((resolve, reject) => {
	        this.addConsentRecord(this.consentManager.consentTable, consent, resolve, reject);
	      });
	    },
	    _resetUpdatedStatus() {
	      for (const contextId in this.consentManager.preferences) {
	        const consents = this.consentManager.preferences[contextId].consents;
	        for (const consentKey in consents) {
	          const currentConsent = consents[consentKey];
	          if (currentConsent._updated) {
	            currentConsent._updated = false;
	          }
	        }
	      }
	    },
	    /**
	     * @function saveContexts([success],[error])
	     *  Save the contexts to the local storage and to the Treasure Data platform
	     *
	     * @param {function} [success] - Callback for when saving the contexts successfully
	     * @param {function} [error] - Callback for when saving the contexts unsuccessfully
	     *
	     * @example
	     * function success () {
	     *   // yay()
	     * }
	     *
	     * function error (err) {
	     *   // err: { success: false, message: 'Timeout' }
	     * }
	     *
	     * sdk.saveContexts(success, error)
	     */
	    saveContexts(success = _.noop, error = _.noop) {
	      // store the consents to cookie first
	      this._savePreferences();
	      const contextList = Object.keys(this.consentManager.preferences).reduce((list, contextId) => {
	        const context = this.consentManager.preferences[contextId];
	        const serializedContext = _.omit(context, ['consents']);
	        list.push(serializedContext);
	        return list;
	      }, []);
	      const promises = contextList.map(context => {
	        return new Promise((resolve, reject) => {
	          this.addConsentRecord(this.consentManager.contextTable, context, resolve, reject);
	        });
	      });
	      Promise.all(promises).then(success).catch(error);
	    },
	    /**
	    * @function saveConsents([success],[error])
	    *  Save the consents to the local storage and to the Treasure Data platform.
	    *  If you don’t specify the callbacks, the callbacks that are configured in the Configurations section above will be called.
	    *
	    * @param {function} [success] - Callback for when saving the consents successfully
	    * @param {function} [error] - Callback for when saving the consents unsuccessfully
	    *
	    * @example
	    * function success () {
	    *   // yay()
	    * }
	    *
	    * function error (err) {
	    *
	    *   // err: { success: false, message: 'Timeout' }
	    *
	    * }
	    *
	    * sdk.saveConsents(success, error)
	    *
	    */
	    saveConsents(success, error) {
	      success = success || this.consentManager.successConsentCallback || _.noop;
	      error = error || this.consentManager.failureConsentCallback || _.noop;

	      // store the consents to cookie first
	      this._savePreferences();
	      var updatedConsents = [];
	      var notUpdatedConsents = [];

	      // send consents to event-collector
	      for (const contextId in this.consentManager.preferences) {
	        const consents = this.consentManager.preferences[contextId].consents;
	        for (const consentKey in consents) {
	          const currentConsent = consents[consentKey];
	          const normalizedConsent = this._getNormalizedConsent(consentKey, currentConsent);
	          if (currentConsent._updated) {
	            updatedConsents.push(normalizedConsent);
	          } else {
	            notUpdatedConsents.push(normalizedConsent);
	          }
	        }
	      }
	      var promises;
	      if (!_.isEmpty(updatedConsents)) {
	        promises = updatedConsents.map(consent => this._getPromise(consent));
	      } else {
	        promises = notUpdatedConsents.map(consent => this._getPromise(consent));
	      }
	      Promise.all(promises).then(() => {
	        success(this._normalizeConsents());
	      }, e => {
	        error({
	          success: false,
	          message: e.message
	        });
	      }).finally(() => {
	        if (!_.isEmpty(updatedConsents)) {
	          this._resetUpdatedStatus();
	        }
	      });
	    },
	    /**
	    * @function addContext(context)
	    * Adding context for consents, the context will be included when we send data to TD platform (event-collector). Users can specify their own context id otherwise a new context id will be generated.
	    * Returns {uuid} context id
	    *
	    * @param context
	    * @property {string} context.brand - brand name
	    * @property {string} context.domain_name - domain name
	    * @property {string} context.collection_type - consent collection type
	    * @property {string} context.collection_point_id - consent collection point id
	    * @property {string} [context.context_id] - Context Id
	    *
	    * @example
	    * sdk.addContext({
	    *   brand: 'A Brand',
	    *   domain_name: 'abrand.com',
	    *   collection_type: 'shopping_cart',
	    *   collection_point_id: 'shopping_trnx_id'
	    *   context_id: 'uuid'
	    * })
	    *
	    */
	    addContext(context = {}) {
	      if (_.isEmpty(context)) return;
	      var contextId;
	      if (_.isString(context.context_id)) {
	        contextId = context.context_id;
	      } else if (_.isFunction(context.context_id)) {
	        contextId = context.context_id();
	      } else {
	        contextId = generateUUID();
	      }
	      var savedContext;
	      const currentContext = this.consentManager.preferences[contextId];
	      if (currentContext) {
	        savedContext = _.assign({}, currentContext, context);
	      } else {
	        savedContext = _.assign({}, context, {
	          context_id: contextId,
	          consents: {}
	        });
	      }
	      this.consentManager.preferences[contextId] = savedContext;
	      return contextId;
	    },
	    /**
	    * @function addConsents(consents)
	    *  Adding consents. For the consents that don’t have context ID, they will be added to a default context
	    *
	    * @param    {object}             consents
	    * @property {object}             consents.consent                    - Specific consent
	    * @property {string}             consents.consent.key                - purpose of consent
	    * @property {object}             consents.consent.values             - consent information
	    * @property {string}             consents.consent.values.description - Consent’s description
	    * @property {string}             consents.consent.values.datatype    - data type
	    * @property {string}             consents.consent.values.status      - Consent’s status (given | refused | notgiven). Default: `notgiven`
	    * @property {string|Number|Date} consents.consent.values.expiry_date - expiry date
	    * @property {string}             consents.consent.values.context_id  - Context Id
	    *
	    * @example
	    * sdk.addConsents({
	    *   'marketing': { // <--- purpose
	    *     description: 'description of consent',
	    *     datatype: 'Attibutes',
	    *     status: 'given|refused',
	    *     expiry_date: 'YYYY-MM-DD',
	    *     context_id: 'context_id'
	    *   },
	    *   'storing': { // <--- purpose
	    *     description: 'description',
	    *     datatype: 'datatype',
	    *     status: 'given|refused',
	    *     expiry_date: 'YYYY-MM-DD',
	    *     context_id: 'context_id'
	    *   },
	    *   'recommendations': { // <--- purpose
	    *     description: 'description',
	    *     datatype: 'datatype',
	    *     status: 'given|refused',
	    *     expiry_date: 'YYYY-MM-DD',
	    *     context_id: 'context_id'
	    *   }
	    * )
	    */
	    addConsents(consents = {}) {
	      if (_.isEmpty(consents)) return;
	      for (const key in consents) {
	        const status = this._isValidStatus(consents[key].status) ? consents[key].status : CONSENT_STATES.NOTGIVEN;
	        var contextId = consents[key].context_id;
	        var expiryDate = consents[key].expiry_date || '';
	        var augmentedConsent;
	        if (!contextId) {
	          contextId = this.defaultContext.context_id;
	          if (!this.consentManager.preferences[contextId]) {
	            this.consentManager.preferences[contextId] = this.defaultContext;
	          }
	        }
	        var currentContext = this.consentManager.preferences[contextId];
	        var current = currentContext && currentContext.consents[key];
	        if (!_.isEmpty(expiryDate) && (_.isString(expiryDate) || _.isNumber(expiryDate) || _.isObject(expiryDate))) {
	          const parsedDate = dayjs(expiryDate, this.consentManager.dateFormat);
	          expiryDate = parsedDate.isValid() ? parsedDate.valueOf() : '';
	        } else {
	          expiryDate = '';
	        }
	        if (!_.isEmpty(current)) {
	          augmentedConsent = _.assign({}, current, consents[key]);
	        } else {
	          augmentedConsent = _.assign({}, consents[key], {
	            key: camelCase(key),
	            status,
	            identifier: this.client.track.uuid,
	            context_id: contextId
	          });
	        }
	        augmentedConsent.issuer = this.consentManager.issuer;
	        augmentedConsent.expiry_date = expiryDate;
	        this.consentManager.preferences[contextId].consents[key] = augmentedConsent;
	      }
	    },
	    /**
	    * @function updateConsent(contextId,consentObject)
	    * Update a specific consent. When you update a consent, only the updated consent is sent to the `successConsentCallback` after calling `saveConsents`.
	    *
	    * @param {string} contextId     - Context Id
	    * @param {object} consentObject - Consent that you want to update
	    *
	    * @example
	    * sdk.updateConsent('xxxxxx-context-id', {
	    *   'recommendations': {
	    *     status: 'refused'
	    *   }
	    * })
	    */
	    updateConsent(contextId, consent = {}) {
	      if (_.isEmpty(this.consentManager.preferences[contextId]) || _.isEmpty(consent)) return;
	      const [consentPurpose] = Object.keys(consent);
	      const currentConsents = this.consentManager.preferences[contextId].consents;
	      for (const purpose in currentConsents) {
	        if (camelCase(purpose) === camelCase(consentPurpose)) {
	          var status = consent[consentPurpose].status || '';
	          var expiryDate = consent[consentPurpose].expiry_date || '';
	          if (!this._isValidStatus(status)) {
	            status = currentConsents[consentPurpose].status;
	          }
	          if (!_.isEmpty(expiryDate) && (_.isString(expiryDate) || _.isNumber(expiryDate) || _.isObject(expiryDate))) {
	            const parsedDate = dayjs(expiryDate, this.consentManager.dateFormat);
	            expiryDate = parsedDate.isValid() ? parsedDate.valueOf() : currentConsents[consentPurpose].expiry_date;
	          } else {
	            expiryDate = currentConsents[consentPurpose].expiry_date;
	          }
	          const filteredConsent = _.omit(currentConsents[consentPurpose], ['expiry_date', 'status']);
	          currentConsents[consentPurpose] = _.assign(filteredConsent, _.omit(consent[consentPurpose], ['expiry_date', 'status']), {
	            identifier: this.client.track.uuid,
	            status,
	            expiry_date: expiryDate
	          });
	          currentConsents[consentPurpose]['_updated'] = true;
	          break;
	        }
	      }
	    },
	    /**
	    * @function updateContext(contextId,values)
	    *  Update a specific context
	    *
	    * @param {string} contextId - Context Id
	    * @param {object} values    - Values of context that you want to update
	    *
	    * @example
	    * sdk.updateContext('xxxxxx-context-id', {
	    *   brand: 'Other brand',
	    *   domain_name: 'otherdomain.com'
	    * })
	    *
	    */
	    updateContext(contextId, values = {}) {
	      const context = this.consentManager.preferences[contextId];
	      if (_.isEmpty(context) || _.isEmpty(values)) return;
	      var contextInfo = _.omit(context, ['consents']);
	      contextInfo = _.assign({}, contextInfo, values);
	      this.consentManager.preferences[contextId] = _.assign({}, context, contextInfo);
	    },
	    /**
	    * @function getConsentExpiryDate(contextId,consentPurpose)
	    * @description Get expiry date for a specific consent
	    *
	    * @param {string} contextId       - Context Id
	    * @param {string} consentPurpose - The consent’s purpose
	    *
	    * @example
	    * sdk.getConsentExpiryDate('context_id', 'analytics')
	    *
	    */
	    getConsentExpiryDate(contextId, consentPurpose) {
	      if (!contextId || !consentPurpose) return;
	      const consents = this.consentManager.preferences[contextId].consents;
	      const consent = consents[consentPurpose];
	      return consent && consent.expiry_date || null;
	    },
	    /**
	    * @function getConsents()
	    * @description Return list of consents
	    */
	    getConsents() {
	      const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences();
	      return Object.keys(preferences || {}).reduce((consents, id) => {
	        const context = preferences[id];
	        const persistedConsents = context.consents;
	        const contextInfo = _.omit(context, ['consents']);
	        for (const key in persistedConsents) {
	          const normalizedConsent = _.assign({}, contextInfo, {
	            status: persistedConsents[key].status,
	            datatype: persistedConsents[key].datatype || '',
	            description: persistedConsents[key].description || '',
	            expiry_date: persistedConsents[key].expiry_date || '',
	            identifier: this.client.track.uuid,
	            purpose: key
	          });
	          consents.push(normalizedConsent);
	        }
	        return consents;
	      }, []);
	    },
	    /**
	    * @function getContexts()
	    * Return list of contexts
	    *
	    */
	    getContexts() {
	      const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences();
	      return Object.keys(preferences || {}).reduce((contexts, id) => {
	        const context = preferences[id];
	        const normalizedContext = _.omit(context, ['consents']);
	        contexts.push(normalizedContext);
	        return contexts;
	      }, []);
	    },
	    /**
	    * @function getExpiredConsents()
	    * Returns expired consents
	    */
	    getExpiredConsents() {
	      const consents = this.getConsents();
	      return consents.filter(consent => {
	        return consent.status === CONSENT_STATES.EXPIRED || this._isExpired(consent);
	      });
	    }
	  };
	  return consentManager;
	}

	var conversion_api_support = {};

	var hasRequiredConversion_api_support;
	function requireConversion_api_support() {
	  if (hasRequiredConversion_api_support) return conversion_api_support;
	  hasRequiredConversion_api_support = 1;
	  var _ = requireLodash();
	  function getCookie(key) {
	    var allCookies = collectCookies();
	    return allCookies[key] || null;
	  }
	  function getCookieByNamePrefix(prefix) {
	    var allCookies = collectCookies();
	    var allKeys = Object.keys(allCookies);
	    return allKeys.reduce(function (acc, val) {
	      if (val.startsWith(prefix)) {
	        acc[val] = allCookies[val];
	      }
	      return acc;
	    }, {});
	  }
	  function collectCookies() {
	    var cookies = document.cookie;
	    if (!cookies) return {};
	    return cookies.split(';').reduce(function (acc, val) {
	      var keyValuePair = val.split('=');
	      acc[keyValuePair[0].trim()] = keyValuePair[1];
	      return acc;
	    }, {});
	  }
	  function getParam(key) {
	    var queryString = window.location.search;
	    var urlParams = new URLSearchParams(queryString);
	    return urlParams.get(key);
	  }
	  conversion_api_support.configure = function () {};

	  // Google
	  var getGoogle_gclid_Param = function () {
	    return {
	      gclid: getParam('gclid')
	    };
	  };
	  var getGoogle_wbraid_Param = function () {
	    return {
	      wbraid: getParam('wbraid')
	    };
	  };
	  var getGoogle_ga_Cookie = function () {
	    return {
	      _ga: getCookie('_ga')
	    };
	  };
	  var getGoogle_gcl_Cookies = function (options) {
	    var prefix = options.gclPrefix || '_gcl';
	    return getCookieByNamePrefix(prefix);
	  };

	  // Facebook
	  var getFacebook_fbp_Cookie = function () {
	    return {
	      _fbp: getCookie('_fbp')
	    };
	  };
	  var getFacebook_fbc_Cookie = function () {
	    return {
	      _fbc: getCookie('_fbc')
	    };
	  };
	  var getFacebook_fbclid_Param = function () {
	    return {
	      fbclid: getParam('fbclid')
	    };
	  };

	  // Instagram
	  var getInstagram_shbts_Cookie = function () {
	    return {
	      shbts: getCookie('shbts')
	    };
	  };
	  var getInstagram_shbid_Cookie = function () {
	    return {
	      shbid: getCookie('shbid')
	    };
	  };
	  var getInstagram_ds_user_id_Cookie = function () {
	    return {
	      ds_user_id: getCookie('ds_user_id')
	    };
	  };
	  var getInstagram_ig_did_Cookie = function () {
	    return {
	      ig_did: getCookie('ig_did')
	    };
	  };

	  // Yahoo!
	  var getYahoo_yclid_Param = function () {
	    return {
	      yclid: getParam('yclid')
	    };
	  };
	  var getYahoo_yj_r_Param = function () {
	    return {
	      yj_r: getParam('yj_r')
	    };
	  };
	  var getYahoo_ycl_yjad_Cookie = function () {
	    return {
	      _ycl_yjad: getCookie('_ycl_yjad')
	    };
	  };
	  var getYahoo_yjr_yjad_Cookie = function () {
	    return {
	      _yjr_yjad: getCookie('_yjr_yjad')
	    };
	  };
	  var getYahoo_yjsu_yjad_Cookie = function () {
	    return {
	      _yjsu_yjad: getCookie('_yjsu_yjad')
	    };
	  };

	  // Line
	  var getLine_lt_cid_Cookie = function () {
	    return {
	      __lt_cid: getCookie('__lt__cid')
	    };
	  };
	  var getLine_lt_sid_Cookie = function () {
	    return {
	      __lt_sid: getCookie('__lt__sid')
	    };
	  };
	  var getLine_ldtag_cl_Param = function () {
	    return {
	      ldtag_cl: getParam('ldtag_cl')
	    };
	  };

	  // Twitter (X)
	  var getX_twclid_Cookie = function () {
	    return {
	      _twclid: getCookie('_twclid')
	    };
	  };
	  var getX_twclid_Param = function () {
	    return {
	      twclid: getParam('twclid')
	    };
	  };

	  // Pinterest
	  var getPinterest_epik_Param = function () {
	    return {
	      epik: getParam('epik')
	    };
	  };
	  var getPinterest_epik_Cookie = function () {
	    return {
	      _epik: getCookie('_epik')
	    };
	  };

	  // Snapchat
	  var getSnapchat_sccid_Param = function () {
	    return {
	      ScCid: getParam('ScCid')
	    };
	  };

	  // Tiktok
	  var getTiktok_ttp_Cookie = function () {
	    return {
	      _ttp: getCookie('_ttp')
	    };
	  };

	  // Marketo
	  var getMarketo_mkto_trk_Cookie = function () {
	    return {
	      _mkto_trk: getCookie('_mkto_trk')
	    };
	  };

	  // Tealium
	  var getTealium_utag_main_Cookie = function () {
	    return {
	      utag_main: getCookie('utag_main')
	    };
	  };
	  var API = {
	    getGoogle_gclid_Param,
	    getGoogle_wbraid_Param,
	    getGoogle_ga_Cookie,
	    getGoogle_gcl_Cookies,
	    getFacebook_fbp_Cookie,
	    getFacebook_fbc_Cookie,
	    getFacebook_fbclid_Param,
	    getInstagram_shbts_Cookie,
	    getInstagram_shbid_Cookie,
	    getInstagram_ds_user_id_Cookie,
	    getInstagram_ig_did_Cookie,
	    getYahoo_yclid_Param,
	    getYahoo_yj_r_Param,
	    getYahoo_ycl_yjad_Cookie,
	    getYahoo_yjr_yjad_Cookie,
	    getYahoo_yjsu_yjad_Cookie,
	    getLine_lt_cid_Cookie,
	    getLine_lt_sid_Cookie,
	    getLine_ldtag_cl_Param,
	    getX_twclid_Param,
	    getX_twclid_Cookie,
	    getPinterest_epik_Param,
	    getPinterest_epik_Cookie,
	    getSnapchat_sccid_Param,
	    getTiktok_ttp_Cookie,
	    getMarketo_mkto_trk_Cookie,
	    getTealium_utag_main_Cookie
	  };
	  var vendorFunctionMappings = {
	    google_ads: ['getGoogle_gclid_Param', 'getGoogle_wbraid_Param'],
	    google_ga: ['getGoogle_ga_Cookie'],
	    google_mp: ['getGoogle_gcl_Cookies'],
	    meta: ['getFacebook_fbp_Cookie', 'getFacebook_fbc_Cookie', 'getFacebook_fbclid_Param'],
	    instagram: ['getInstagram_shbts_Cookie', 'getInstagram_shbid_Cookie', 'getInstagram_ds_user_id_Cookie', 'getInstagram_ig_did_Cookie'],
	    yahoojp_ads: ['getYahoo_yclid_Param', 'getYahoo_yj_r_Param', 'getYahoo_ycl_yjad_Cookie', 'getYahoo_yjr_yjad_Cookie', 'getYahoo_yjsu_yjad_Cookie'],
	    line: ['getLine_lt_cid_Cookie', 'getLine_lt_sid_Cookie', 'getLine_ldtag_cl_Param'],
	    x: ['getX_twclid_Param', 'getX_twclid_Cookie'],
	    pinterest: ['getPinterest_epik_Param', 'getPinterest_epik_Cookie'],
	    snapchat: ['getSnapchat_sccid_Param'],
	    tiktok: ['getTiktok_ttp_Cookie'],
	    marketo: ['getMarketo_mkto_trk_Cookie'],
	    tealium: ['getTealium_utag_main_Cookie']
	  };
	  function collectTagsByVendors(vendors = [], options = {}) {
	    return vendors.reduce(function (acc, val) {
	      var fnNames = vendorFunctionMappings[val] || [];
	      fnNames.forEach(function (fnName) {
	        acc = Object.assign(acc, API[fnName].call(null, options));
	      });
	      return acc;
	    }, {});
	  }
	  function collectTagsByCookieNames(cookieNames = []) {
	    return cookieNames.reduce(function (acc, val) {
	      acc = Object.assign(acc, {
	        [val]: getCookie(val)
	      });
	      return acc;
	    }, {});
	  }
	  function collectTagsByParamNames(params = []) {
	    return params.reduce(function (acc, val) {
	      acc = Object.assign(acc, {
	        [val]: getParam(val)
	      });
	      return acc;
	    }, {});
	  }
	  function collectAllTags(options = {}) {
	    var tags = {};
	    var vendorKeys = Object.keys(vendorFunctionMappings);
	    vendorKeys.forEach(function (vendor) {
	      var vendorFns = vendorFunctionMappings[vendor];
	      var vendorTags = vendorFns.reduce(function (acc, val) {
	        acc = Object.assign(acc, API[val].call(null, options));
	        return acc;
	      }, {});
	      tags = Object.assign(tags, vendorTags);
	    });

	    // filter empty values
	    return Object.keys(tags).reduce(function (acc, val) {
	      if (tags[val]) {
	        acc[val] = tags[val];
	      }
	      return acc;
	    }, {});
	  }
	  /**
	   * Collect Ads cookies and parameters for Conversion APIs
	   *
	   * @param    {object}   configs - (Optional) object containing configuration information
	   * @param    {object}   options - (Optional) object containing extra configurations
	   *
	   * Extra configurations only support Google Marketing Platform (Conversion Linker) for setting
	   * custom cookie prefix
	   *
	   * @example
	   * var td = new Treasure({...})
	   * td.collectTags({
	   *    vendors: ['meta', 'google_ga', 'google_mp'],
	   *    cookies: ['_cookie_a', '_cookie_b'],
	   *    params: ['paramA', 'paramB']
	   * }, {
	   *    gclPrefix: '_gcl2'
	   * })
	   *
	   */
	  conversion_api_support.collectTags = function (configs = {}, options = {}) {
	    var isEmptyConfigValues = _.isEmpty(configs.vendors) && _.isEmpty(configs.cookies) && _.isEmpty(configs.params);
	    var tags = {};
	    if (_.isEmpty(configs) || isEmptyConfigValues) {
	      tags = collectAllTags(options);
	    } else {
	      if (!_.isEmpty(configs.vendors)) {
	        tags = Object.assign(tags, collectTagsByVendors(configs.vendors, options));
	      }
	      if (!_.isEmpty(configs.cookies)) {
	        tags = Object.assign(tags, collectTagsByCookieNames(configs.cookies));
	      }
	      if (!_.isEmpty(configs.params)) {
	        tags = Object.assign(tags, collectTagsByParamNames(configs.params));
	      }
	    }
	    Object.keys(tags).forEach(function (tagKey) {
	      this.set('$global', tagKey, tags[tagKey]);
	    }.bind(this));
	  };
	  return conversion_api_support;
	}

	var utm = {};

	var hasRequiredUtm;
	function requireUtm() {
	  if (hasRequiredUtm) return utm;
	  hasRequiredUtm = 1;
	  var _ = requireLodash();
	  function collectUTMParameters() {
	    var searchString = window.location.search;
	    var searchParams = new URLSearchParams(searchString);
	    var utmParams = ['utm_id', 'utm_medium', 'utm_source_platform', 'utm_source', 'utm_campaign', 'utm_marketing_tactic'];
	    var hasParams = utmParams.some(function (param) {
	      return searchParams.has(param);
	    });
	    if (!hasParams) return {};
	    return utmParams.reduce(function (acc, value) {
	      var paramObj = {};
	      var paramValue = searchParams.get(value);
	      if (paramValue) {
	        paramObj[value] = searchParams.get(value);
	      }
	      return Object.assign(acc, paramObj);
	    }, {});
	  }
	  utm.configure = function () {
	    var collectedUTMParams = collectUTMParameters();
	    if (_.isObject(collectedUTMParams) && !_.isEmpty(collectedUTMParams)) {
	      Object.keys(collectedUTMParams).forEach(function (paramName) {
	        this.set('$global', paramName, collectedUTMParams[paramName]);
	      }.bind(this));
	    }
	  };
	  return utm;
	}

	var treasure;
	var hasRequiredTreasure;
	function requireTreasure() {
	  if (hasRequiredTreasure) return treasure;
	  hasRequiredTreasure = 1;
	  var record = requireRecord();
	  var _ = requireLodash();
	  var configurator = requireConfigurator();
	  var version = requireVersion();
	  var cookie = requireJsCookies();
	  var config = requireConfig();

	  /**
	   * @typedef {object} config
	   * @property {string}        config.database                                 - database name, must consist only of lower case letters, numbers, and `_`, must be longer than or equal to 3 chars, and the total length of database and table must be shorter than 129 chars.
	   * @property {string}        config.writeKey                                 - write-only key, get it from your user profile
	   * @property {string}        [config.pathname]                               - path to append after host. Default: `/js/v3/events`
	   * @property {string}        [config.host]                                   - host to which events get sent. Default: `in.treasuredata.com`
	   * @property {boolean}       [config.development]                            - triggers development mode which causes requests to be logged and not get sent. Default: `false`
	   * @property {boolean}       [config.logging]                                - enable or disable logging. Default: `true`
	   * @property {string}        [config.globalIdCookie]                         - cookie td_globalid name. Default: `_td_global`
	   * @property {boolean}       [config.startInSignedMode]                      - Tell the SDK to default to Signed Mode if no choice is already made. Default: `false`
	   * @property {number}        [config.jsonpTimeout]                           - JSONP timeout (in milliseconds) Default: `10000`
	   * @property {boolean}       [config.storeConsentByLocalStorage]             - Tell the SDK to use localStorage to store user consent. Default: `false`
	   * @property {string}        [config.clientId]                               - uuid for this client. When undefined it will attempt fetching the value from a cookie if storage is enabled, if none is found it will generate a v4 uuid
	   * @property {object|string} [config.storage]                                - storage configuration object. When `none` it will disable cookie storage
	   * @property {string}        [config.storage.name]                           - cookie name. Default: `_td`
	   * @property {integer}       [config.storage.expires]                        - cookie expiration in seconds. When 0 it will expire with the session. Default: `63072000` (2 years)
	   * @property {string}        [config.storage.domain]                         - cookie domain. Default: result of `document.location.hostname`
	   * @property {boolean}       [config.useServerSideCookie]                    - enables/disable using ServerSide Cookie. Default: `false`
	   * @property {string}        [config.sscDomain]                              - Domain against which the Server Side Cookie is set. Default: `window.location.hostname`
	   * @property {string}        [config.sscServer]                              - hostname to request server side cookie from. Default: `ssc.${sscDomain}`
	   * @property {string}        [config.cdpHost]                                - The host to use for the Personalization API. Default: 'cdp.in.treasuredata.com'
	   * @property {object}        [config.consentManager]                         - Consent Manager configuration, setup along with the TD JavaScript SDK initialization.Every time when a page is loaded, TD JS Consent Extension will check the consent expiry date and if there’s any expired consent, then the expiredConsentCallback is triggered. It also updates status of the expired consent to expired
	   * @property {string}        [config.consentManager.storageKey]              - Name of the local storage. Default: `td_consent_preferences`
	   * @property {string}        [config.consentManager.consentTable]            - Name of the consent table. Default: `td_cm_consent`
	   * @property {string}        [config.consentManager.contextTable]            - Name of the context table. Default: `td_cm_context`
	   * @property {string}        [config.consentManager.issuer]                  - Name of the consent management platform. Default: `treasuredata`
	   * @property {string}        [config.consentManager.dateFormat]              - Date format string. Default: `YYYY-MM-DD`
	   * @property {function}      [config.consentManager.successConsentCallback]  - Successful saving consent callback
	   * @property {function}      [config.consentManager.failureConsentCallback]  - Failed to save consent callback
	   * @property {function}      [config.consentManager.expiredConsentsCallback] - Expired consent callback
	   *
	   * */
	  /**
	   * @description Creates a new Treasure logger instance. If the database does not exist and you have permissions, it will be created for you.
	   *
	   * @param {Treasure.config} config - Treasure Data instance configuration parameters
	   * @see {@link config}
	   *
	   * @returns {td_instance} Treasure logger instance object
	   *
	   * @example
	   * var foo = new Treasure({
	   *   database: 'foo',
	   *   writeKey: 'your_write_only_key'
	   * });
	   *
	   * */
	  function Treasure(options) {
	    // enforces new
	    if (!(this instanceof Treasure)) {
	      return new Treasure(options);
	    }
	    this.init(options);
	    return this;
	  }
	  Treasure.prototype.init = function (options) {
	    this.configure(options);
	    for (var plugin in Treasure.Plugins) {
	      if (Treasure.Plugins.hasOwnProperty(plugin)) {
	        Treasure.Plugins[plugin].configure.call(this, options);
	      }
	    }
	    if (window.addEventListener) {
	      var that = this;
	      window.addEventListener('pagehide', function () {
	        that._windowBeingUnloaded = true;
	      });
	    }
	  };
	  Treasure.version = Treasure.prototype.version = version;
	  Treasure.prototype.log = function () {
	    var args = ['[' + config.GLOBAL + ']'];
	    for (var i = 0, len = arguments.length - 1; i <= len; i++) {
	      args.push(arguments[i]);
	    }
	    if (typeof console !== 'undefined' && this.client.logging) {
	      console.log.apply(console, args);
	    }
	  };
	  Treasure.prototype.configure = configurator.configure;
	  Treasure.prototype.set = configurator.set;
	  Treasure.prototype.get = configurator.get;
	  Treasure.prototype.isGlobalIdEnabled = configurator.isGlobalIdEnabled;
	  Treasure.prototype.ready = requireReady();
	  Treasure.prototype.applyProperties = record.applyProperties;
	  Treasure.prototype.addRecord = record.addRecord;
	  Treasure.prototype.addConsentRecord = record.addConsentRecord;
	  Treasure.prototype._sendRecord = record._sendRecord;
	  Treasure.prototype.blockEvents = record.blockEvents;
	  Treasure.prototype.unblockEvents = record.unblockEvents;
	  Treasure.prototype.areEventsBlocked = record.areEventsBlocked;
	  Treasure.prototype.setSignedMode = record.setSignedMode;
	  Treasure.prototype.setAnonymousMode = record.setAnonymousMode;
	  Treasure.prototype.inSignedMode = record.inSignedMode;
	  Treasure.prototype.getCookie = cookie.getItem;
	  Treasure.prototype._configurator = configurator;

	  // Plugins
	  Treasure.Plugins = {
	    Clicks: requireClicks(),
	    GlobalID: requireGlobalid(),
	    Personalization: requirePersonalization(),
	    Track: requireTrack(),
	    ServerSideCookie: requireServercookie(),
	    ConsentManager: requireConsentManager(),
	    ConversionAPI: requireConversion_api_support(),
	    UTMTracking: requireUtm()
	  };

	  // Load all plugins
	  _.forIn(Treasure.Plugins, function (plugin) {
	    _.forIn(plugin, function (method, name) {
	      if (!Treasure.prototype[name]) {
	        Treasure.prototype[name] = method;
	      }
	    });
	  });
	  treasure = Treasure;
	  return treasure;
	}

	/*
	 * Treasure Client Loader
	 */
	var loadClients;
	var hasRequiredLoadClients;
	function requireLoadClients() {
	  if (hasRequiredLoadClients) return loadClients;
	  hasRequiredLoadClients = 1;
	  // Modules
	  var _ = requireLodash();
	  var window = requireWindow();

	  // Helpers
	  function applyToClient(client, method) {
	    var _method = '_' + method;
	    if (client[_method]) {
	      var arr = client[_method] || [];
	      while (arr.length) {
	        client[method].apply(client, arr.shift());
	      }
	      delete client[_method];
	    }
	  }

	  // Constants
	  var TREASURE_KEYS = ['init', 'set', 'collectTags', 'blockEvents', 'unblockEvents', 'setSignedMode', 'setAnonymousMode', 'resetUUID', 'addRecord', 'fetchGlobalID', 'trackPageview', 'trackEvent', 'trackClicks', 'fetchUserSegments', 'fetchPersonalization', 'fetchServerCookie', 'ready'];

	  /*
	   * Load clients
	   */
	  loadClients = function loadClients(Treasure, name) {
	    if (_.isObject(window[name])) {
	      var snippet = window[name];
	      var clients = snippet.clients;

	      // Copy over Treasure.prototype functions over to snippet's prototype
	      // This allows already-instanciated clients to work
	      _.forIn(Treasure.prototype, function (value, key) {
	        snippet.prototype[key] = value;
	      });

	      // Iterate over each client instance
	      _.forEach(clients, function (client) {
	        // Call each key and with any stored values
	        _.forEach(TREASURE_KEYS, function (value) {
	          applyToClient(client, value);
	        });
	      });
	    }
	  };
	  return loadClients;
	}

	/*
	 * Treasure Index
	 */
	var hasRequiredLib;
	function requireLib() {
	  if (hasRequiredLib) return lib;
	  hasRequiredLib = 1;
	  var Treasure = requireTreasure();
	  var window = requireWindow();
	  var GLOBAL = requireConfig().GLOBAL;

	  // Load all cached clients
	  requireLoadClients()(Treasure, GLOBAL);

	  // Expose the library on the window
	  window[GLOBAL] = Treasure;
	  return lib;
	}

	var libExports = requireLib();
	var index = /*@__PURE__*/getDefaultExportFromCjs(libExports);

	return index;

})();
