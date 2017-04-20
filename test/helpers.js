function leafChild (el) {
  var child = el.children && el.children[0]
  if (child && child.nodeType === 1) {
    return leafChild(child)
  } else {
    return el
  }
}

function createTestElement (name, parentNode) {
  var el = document.createElement(name)
  parentNode = parentNode || document.body
  el.style.display = 'none'
  parentNode.appendChild(el)
  return el
}

module.exports = {
  createTestElement: createTestElement,
  leafChild: leafChild
}
