var window = require('global/window')
var createTreasure = require('./createTreasure')
var assert = require('./lib/assert')
var isArray = require('./lib/isArray')
var isFunction = require('./lib/isFunction')
var isString = require('./lib/isString')
var ready = require('./lib/ready')
// var log = require('./lib/log')
var forEach = require('./lib/forEach')

module.exports = function loadClient (name, scaffold) {
  function client (action, input) {
    if (isFunction(action)) {
      ready(function () {
        action(client.instance)
      })
    } else if (isString(action)) {
      var inputParams = input || {}
      switch (action) {
        case 'create':
          assert(!client.instance, 'already called create')
          client.instance = createTreasure(inputParams)
          break
        case 'send':
        case 'setGlobalContext':
        case 'setTableContext':
        case 'trackClicks':
        case 'trackEvent':
        case 'trackPageview':
          assert(!!client.instance, 'must call create')
          client.instance[action](inputParams)
          break
        default:
          // log('unknown action', action)
          break
      }
    } else {
      // log('unexpected action', action)
    }
  }

  client.instance = null

  window[name] = client

  if (scaffold && isArray(scaffold.q)) {
    forEach(scaffold.q, function (args) {
      client.apply(client, args)
    })
  }
}
