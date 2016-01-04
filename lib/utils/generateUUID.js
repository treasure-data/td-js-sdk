// Maybe look into a more legit solution later
// node-uuid doesn't work with old IE's
// Source: http://stackoverflow.com/a/8809472
module.exports = function generateUUID () {
  var d = new Date().getTime()
  if (global.performance && typeof global.performance.now === 'function') {
    d += global.performance.now() // use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}
