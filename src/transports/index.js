var setManyLazy = require('../lib/lazy').setManyLazy
var bestOrder = ['beacon', 'xhr', 'jsonp']

function getTransport (transportName) {
  if (transportName === 'auto') {
    for (var index = 0; index < bestOrder.length; index++) {
      var transport = options[bestOrder[index]]
      if (transport.isAvailable()) {
        return transport
      }
    }
  } else {
    return options[transportName]
  }
  return null
}

var options = setManyLazy({}, {
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
  getTransport: getTransport,
  options: options
}
