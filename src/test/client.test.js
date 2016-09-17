var test = require('tape-catch')
var createClient = require('../client')
var defaultConfig = require('../defaultConfig')
var assign = require('../lib/assign')
var forEach = require('../lib/forEach')
var Transport = require('../transport')

test('createClient inputConfig', function (t) {
  t.plan(3)
  t.throws(function () {
    createClient({ apiKey: 'apiKey' })
  }, /invalid/, 'missing database')
  t.throws(function () {
    createClient({ database: 'database' })
  }, /invalid/, 'missing apiKey')
  t.doesNotThrow(function () {
    createClient({ apiKey: 'apiKey', database: 'database' })
  }, /invalid/, 'nothing missing')
})

test('client.config', function (t) {
  t.plan(2)

  var inputConfig = { apiKey: 'apiKey', database: 'database' }
  var basicClient = createClient(inputConfig)
  t.deepEqual(
    assign({}, defaultConfig, inputConfig),
    basicClient.config,
    'using defaultConfig'
  )

  var advancedInputConfig = assign({}, defaultConfig, inputConfig, {
    clicksTable: 'clicksTable',
    cookieExpiresDays: 1,
    cookieName: 'cookieName',
    eventsTable: 'eventsTable',
    host: 'localhost',
    pageviewsTable: 'pageviewsTable',
    pathname: '/',
    protocol: 'http:'
  })
  var advancedClient = createClient(advancedInputConfig)
  t.deepEqual(
    advancedInputConfig,
    advancedClient.config,
    'overwrites defaultConfig'
  )
})

test('client.transport', function (t) {
  t.plan(4)

  var inputConfig = { apiKey: 'apiKey', database: 'database' }
  var bestTransport = Transport.pickBest()
  t.equal(
    createClient(inputConfig).transport,
    bestTransport,
    'auto pick transport'
  )

  forEach(['beacon', 'jsonp', 'xhr'], function (transport) {
    var client = createClient(assign({ transport: transport }, inputConfig))
    console.log(client.transport)
    t.equal(
      client.transport,
      Transport.transports[transport],
      'force ' + transport + ' transport'
    )
  })
})

test('client.getURL', function (t) {
  t.plan(3)

  var basicInputConfig = {
    apiKey: 'apiKey',
    database: 'database',
    protocol: 'http:'
  }
  var basicClient = createClient(basicInputConfig)
  t.throws(function () {
    basicClient.getURL()
  }, /invalid/, 'missing table')
  t.equal(
    basicClient.getURL('table'),
    'http://in.treasuredata.com/js/v3/event/database/table',
    'valid table'
  )

  var advancedInputConfig = assign({ host: 'host', pathname: '/pathname/' }, basicInputConfig)
  var advancedClient = createClient(advancedInputConfig)
  t.equal(
    advancedClient.getURL('table'),
    'http://host/pathname/database/table',
    'overwritten host and pathname'
  )
})

test('client.setGlobalContext', function (t) {
  t.plan(2)

  var client = createClient({ apiKey: 'apiKey', database: 'database' })
  t.throws(function () {
    client.setGlobalContext()
  }, /invalid values/, 'missing values')
  var values = { a: 1, b: 2, c: 3 }
  client.setGlobalContext(values)
  t.deepEqual(client.globalContext, values)
})

test('client.setTableContext', function (t) {
  t.plan(3)

  var client = createClient({ apiKey: 'apiKey', database: 'database' })
  t.throws(function () {
    client.setTableContext()
  }, /invalid table/, 'missing table')
  t.throws(function () {
    client.setTableContext('table')
  }, /invalid values/, 'missing values')

  client.setTableContext('abc', { a: 1 })
  client.setTableContext('abc', { b: 2 })
  client.setTableContext('table', { value: true })
  t.deepEqual(
    client.tableContext,
    { abc: { a: 1, b: 2 }, table: { value: true } },
    'valid table and values'
  )
})

