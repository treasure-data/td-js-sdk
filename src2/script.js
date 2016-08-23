/**
 * This is the <script> version's entry-point.
 * It'll wait for DOM ready before initializing
 * If JSON.stringify is missing (IE8 in compat mode), it'll load JSON3 first
 */
// var GLOBAL_ALIAS = 'TreasureDataObject'
// var GLOBAL_NAME = 'td'

var global = require('global')
require('domready')(
  global.JSON && global.JSON.stringify
    ? main
    : require('./loadJSON3')(main)
)

function main (err) {
  if (err) {
    throw err
  }

  var name = utils.isString(global[GLOBAL_ALIAS]) &&
    utils.stripWhitespace(global[GLOBAL_ALIAS]) ||
    GLOBAL_NAME

  var instance = global[name]
  if (!instance || !instance.loaded) {
    // var queue = instance &&
  }
  // var instance = getGlobalInstance('TreasureDataObject', 'td')

}

// function getGlobalInstance (globalName, fallbackName) {
//   var name = utils.isString(global[globalName]) &&
//     utils.stripWhitespace(global[globalName]) ||
//     fallbackName
//   return global[name]
// }

