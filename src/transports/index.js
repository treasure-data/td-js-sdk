var setLazy = require('../lib/setLazy')

/** @const */
var bestOrder = ['beacon', 'xhr', 'jsonp']

// /** @const */
// var RequestParams = require('../types').RequestParams // eslint-disable-line no-unused-vars

// /** @const */
// var Transport = require('../types').Transport // eslint-disable-line no-unused-vars

// /** @const */
// var TransportType = require('../types').TransportType // eslint-disable-line no-unused-vars

/**
 * @param {TransportType} transportName
 * @return {?Transport}
 */
function getTransport (transportName) {
  if (choices[transportName]) {
    return choices[transportName]
  }
  if (transportName === 'auto') {
    for (var index = 0; index < bestOrder.length; index++) {
      var transport = choices[bestOrder[index]]
      if (transport.isAvailable()) {
        return transport
      }
    }
  }
  return null
}

var choices = setLazy({}, {
  beacon: function () {
    return require('./beacon')
  },
  jsonp: function () {
    return require('./jsonp')
  },
  xhr: function () {
    return require('./xhr')
  }
})

module.exports = {
  choices: choices,
  getTransport: getTransport
}
