module.exports = function log () {
  /* istanbul ignore else */
  if (typeof console !== 'undefined') {
    var args = ['[td]']
    var length = arguments.length
    for (var i = 0; i < length; i++) {
      args.push(arguments[i])
    }
    console.log.apply(console, args)
  }
}
