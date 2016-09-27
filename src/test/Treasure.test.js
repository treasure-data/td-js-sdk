var test = require('tape-catch')
var Treasure = require('../Treasure').Treasure
var noop = require('../lib/noop')

test('Treasure.getClientId hardcoded', function (t) {
  t.plan(1)
  t.equal(
    Treasure.getClientId({ clientId: 'clientId' }),
    'clientId',
    'hardcoded clientId'
  )
})

test('Treasure.getClientId generated', function (t) {
  t.plan(3)
  var clientId = Treasure.getClientId({ cookieEnabled: false })
  t.equal(clientId.length, 32, 'generated clientId length')
  t.equal(clientId.charAt(12), '4', 'generated clientId uuid version')
  t.ok(/(8|9|a|b)/.test(clientId.charAt(16)), 'generated clientId variant')
})

test('Treasure.getConfig validation', function (t) {
  t.plan(3)
  t.throws(function () {
    Treasure.getConfig({ apiKey: 'apiKey' })
  }, /invalid/, 'invalid database')
  t.throws(function () {
    Treasure.getConfig({ database: 'database' })
  }, /invalid/, 'invalid apiKey')
  t.doesNotThrow(function () {
    Treasure.getConfig({ apiKey: 'apiKey', database: 'database' })
  }, /invalid/, 'nothing missing')
})

test('Treasure.getConfig return', function (t) {
  t.plan(1)
  t.deepEqual(Treasure.getConfig({
    apiKey: 'apiKey',
    cookieEnabled: false,
    database: 'database',
    protocol: 'https:'
  }), {
    apiKey: 'apiKey',
    clicksIgnoreAttribute: 'td-ignore',
    clicksTable: 'clicks',
    clientId: null,
    cookieDomain: 'auto',
    cookieEnabled: false,
    cookieExpires: 730,
    cookieName: '_td',
    database: 'database',
    eventsTable: 'events',
    host: 'in.treasuredata.com',
    pageviewsTable: 'pageviews',
    pathname: '/js/v3/event/',
    protocol: 'https:',
    transport: 'auto'
  })
})

test('Treasure.getURL', function (t) {
  t.plan(2)
  t.throws(function () {
    Treasure.getURL({}, 'TABLE')
  }, /invalid/, 'invalid table')

  t.equal(
    Treasure.getURL({
      database: 'database',
      host: 'in.treasuredata.com',
      pathname: '/js/v3/event/',
      protocol: 'https:'
    }, 'table'),
    'https://in.treasuredata.com/js/v3/event/database/table',
    'valid table'
  )
})

test('Treasure#buildRequestParams', function (t) {
  t.plan(8)
  var treasure = new Treasure({
    apiKey: 'apiKey',
    database: 'database',
    protocol: 'https:'
  })

  t.throws(function () {
    treasure.buildRequestParams({ table: 'table' })
  }, /invalid/, 'invalid data')

  t.throws(function () {
    treasure.buildRequestParams({ data: {} })
  }, /invalid/, 'invalid table')

  function callback () {}
  var overwritingRequestParams = treasure.buildRequestParams({
    apiKey: 'API_KEY',
    callback: callback,
    data: {},
    modified: 1,
    sync: true,
    table: 'table',
    url: 'https://localhost/'
  })
  t.deepEqual(overwritingRequestParams, {
    apiKey: 'API_KEY',
    callback: callback,
    data: {},
    modified: 1,
    sync: true,
    url: 'https://localhost/'
  })

  var defaultsRequestParams = treasure.buildRequestParams({
    data: {},
    table: 'table'
  })
  t.equal(defaultsRequestParams.apiKey, 'apiKey')
  t.equal(defaultsRequestParams.callback, noop)
  t.equal(defaultsRequestParams.sync, false)
  t.equal(typeof defaultsRequestParams.modified, 'number')
  t.equal(
    defaultsRequestParams.url,
    'https://in.treasuredata.com/js/v3/event/database/table'
  )
})

test('Treasure#send', function (t) {
  t.plan(1)
  var treasure = new Treasure({
    apiKey: 'apiKey',
    database: 'database',
    protocol: 'https:'
  })
  treasure.transport = {
    send: function send (params) {
      t.deepEqual(params, {
        apiKey: 'apiKey',
        callback: noop,
        data: {
          a: 1
        },
        modified: 1,
        sync: true,
        url: 'https://in.treasuredata.com/js/v3/event/database/table'
      })
    }
  }
  treasure.send({
    data: {
      a: 1
    },
    modified: 1,
    sync: true,
    table: 'table'
  })
})
