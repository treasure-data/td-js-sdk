var setManyLazy = require('../lib/lazy').setManyLazy
var bestOrder = ['beacon', 'xhr', 'jsonp']

// Returns the best available transport for your environment
function pickBest () {
  for (var index = 0; index < bestOrder.length; index++) {
    var transport = transports[bestOrder[index]]
    if (transport.canUse()) {
      return transport
    }
  }
  return null
}

/**
 * These are all the possible transports for sending data
 * @TODO: Update types
 *
 * @type EventParams = {...}
 * @type RequestParams = {...}
 * @interface Transport = {
 *   canUse: (void) => void,
 *   prepare: (eventParams: EventParams) => RequestParams,
 *   send: (requestPaams: RequestParams) => boolean,
 *   validate: (requestParams: RequestParams) => boolean
 * }
 */
var transports = setManyLazy({}, {
  beacon: function () {
    return require('./beacon')
  },
  jsonp: function () {
    return require('./jsonp')
  },
  xhr: function () {
    return require('./jsonp')
  }
})

module.exports = {
  bestOrder: bestOrder,
  pickBest: pickBest,
  transports: transports
}
