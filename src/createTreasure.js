module.exports = function createTreasure (inputConfig) {
  var Treasure = require('./Treasure')
  var treasure = new Treasure(inputConfig)
  treasure.initialize()
  return treasure
}
