/**
 * Fake lodash
 * Only import the parts of lodash that I'm using to reduce bundle size
 */
module.exports = {
  // Collection
  forEach: require('lodash-compat/collection/forEach'),

  // Lang
  isNumber: require('lodash-compat/lang/isNumber'),
  isObject: require('lodash-compat/lang/isObject'),
  isString: require('lodash-compat/lang/isString'),
  isArray: require('lodash-compat/lang/isArray'),
  keys: require('lodash-compat/object/keys'),
  // Object
  assign: require('lodash-compat/object/assign'),
  forIn: require('lodash-compat/object/forIn'),
  omit: require('lodash-compat/object/omit'),
  // Utility
  noop: require('lodash-compat/utility/noop')
}
