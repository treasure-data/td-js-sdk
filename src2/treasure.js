// var createClientFactory = require('./client').createClientFactory
// var defaultConfig = {
//   // debugging: false,
//   host: 'in.treasuredata.com',
//   pathname: '/js/v3/event/'
//   // requestType: 'jsonp'
//   // requestType: 'auto'
// }
// var createTreasure = createClientFactory(defaultConfig)

// module.exports = createTreasure

// var createClient = require('./client').createClient
// var createTracker = require('./tracker').createTracker
// var createTreasure = createClientFactory(defaultConfig)



function createTreasure (config) {
  var client = require('./client').createClient(config)
  var tracker = require('./tracker').createTracker(config.tracker)
  // client.addRequests()

  // var tracker = require('./tracker').createTracker(config.tracker)
  // tracker.initialize()
  // network.initialize()

  return {
    _client: client,
    _tracker: tracker,

    // setupCookieTracker: tracker.enableCookieTracker,


    // initialize: initialize
    // setGlobalContext: client.setGlobalContext,
    // setTableContext: client.setTableContext,
    // dispatch: function (action) {
    // }
    // getState: function () {
    // }
  }

  function initialize () {
    tracker.initialize()
  }

}

module.exports = {
  createTreasure: createTreasure
}

// function exposeMethod (object, method) {
//   return function () {
//     var args = []
//     for (var idx = 0; idx < arguments.length; idx++) {
//       args.push(arguments[idx])
//     }
//     return object[method].call(object, args)
//   }
// }
