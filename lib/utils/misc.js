function assert (conditon, text) {
  if (!conditon) {
    throw new Error(text)
  }
}

function disposable (action) {
  var disposed = false
  return function dispose () {
    if (!disposed) {
      disposed = true
      action()
    }
  }
}

function noop () {}

module.exports = {
  assert: assert,
  disposable: disposable,
  noop: noop
}
