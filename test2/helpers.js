function leafChild (el) {
  var child = el.children && el.children[0]
  if (child && child.nodeType === 1) {
    return leafChild(child)
  } else {
    return el
  }
}

function createTestElement (name) {
  var el = document.createElement(name)
  el.style.display = 'none'
  document.body.appendChild(el)
  return el
}

module.exports = {
  createTestElement: createTestElement,
  leafChild: leafChild
}
