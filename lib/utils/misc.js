function disposable (action) {
  var disposed = false
  return function dispose () {
    if (!disposed) {
      disposed = true
      action()
    }
  }
}

module.exports = {
  disposable: disposable
}
