var window = require('global/window')
var getIn = require('./object').getIn

function addEventListener (el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, handler, false)
    return function dispose () {
      el.removeEventListener(type, handler, false)
    }
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, handler)
    return function dispose () {
      el.deatchEvent('on' + type, handler)
    }
  } else {
    throw new Error('addEventListener')
  }

  // IE8 doesn't pass an event param, grab it from the window if it's missing
  // Calls the real handler with the correct context, even if we don't use it
  function handler (event) {
    fn.call(el, event || window.event)
  }
}

// Info: http://www.quirksmode.org/js/events_properties.html
function getEventTarget (event) {
  // W3C says it's event.target, but IE8 uses event.srcElement
  var target = getIn(event, 'target') || getIn(event, 'srcElement') || window.document

  // If an event takes place on an element that contains text, this text node,
  // and not the element, becomes the target of the event
  return target.nodeType === 3 ? target.parentNode : target
}

module.exports = {
  addEventListener: addEventListener,
  getEventTarget: getEventTarget
}
