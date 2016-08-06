/**
 * Fake lodash
 * Only import the parts of lodash that I'm using to reduce bundle size
 */
module.exports = {
  // Array
  indexOf: require('lodash-compat/array/indexOf'),

  // Collection
  includes: require('lodash-compat/collection/includes'),
  max: require('lodash-compat/collection/max'),
  forEach: require('lodash-compat/collection/forEach'),

  // Lang
  clone: require('lodash-compat/lang/clone'),
  isEqual: require('lodash-compat/lang/isEqual'),
  isFunction: require('lodash-compat/lang/isFunction'),
  isNumber: require('lodash-compat/lang/isNumber'),
  isObject: require('lodash-compat/lang/isObject'),
  isString: require('lodash-compat/lang/isString'),

  // Object
  assign: require('lodash-compat/object/assign'),
  defaults: require('lodash-compat/object/defaults'),
  forIn: require('lodash-compat/object/forIn'),

  // Utility
  noop: require('lodash-compat/utility/noop'),
  mixin: require('lodash-compat/utility/mixin')
}
