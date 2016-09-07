var objOwnProperty = Object.prototype.hasOwnProperty
module.exports = function hasKey (object, key) {
  return objOwnProperty.call(object, key)
}
