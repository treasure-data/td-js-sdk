module.exports = function log () {
  if (typeof console !== 'undefined') {
    var args = ['[Treasure]']
    for (var i = 0, length = arguments.length; i < length; i++) {
      args.push(arguments[i])
    }
    console.log.apply(console, args)
  }
}
