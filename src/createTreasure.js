var Treasure = require('./Treasure').Treasure

// /** @const */
// var TreasureInput = require('./types').TreasureInput // eslint-disable-line no-unused-vars

/**
 * @param {!TreasureInput} inputConfig
 * @returns {Treasure}
 */
module.exports = function createTreasure (inputConfig) {
  var treasure = new Treasure(inputConfig)
  treasure.initialize()
  return treasure
}
