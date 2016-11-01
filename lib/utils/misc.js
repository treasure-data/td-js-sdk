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

module.exports = {
  assert: assert,
  disposable: disposable
}
