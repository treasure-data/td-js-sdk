function disposable (action) {
  var disposed = false
  return function dispose () {
    if (!disposed) {
      disposed = true
      action()
    }
  }
}

function invariant (conditon, text) {
  if (!conditon) {
    throw new Error(text)
  }
}

function noop () {}

module.exports = {
  disposable: disposable,
  invariant: invariant,
  noop: noop
}
