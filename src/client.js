var defaultConfig = require('./defaultConfig')
var date = require('./lib/date')
var lang = require('./lib/lang')
var object = require('./lib/object')
var isValidResourceName = require('./lib/string').isValidResourceName
var assert = require('./lib/util').assert
var transport = require('./transport')
var isObject = lang.isObject
var isString = lang.isString

function createClient (clientConfig) {
  var config = object.assign({}, defaultConfig, clientConfig)
  assert(
    isValidResourceName(config.database) && isString(config.apiKey),
    'invalid database or apikey'
  )

  var clientTransport = config.transport
    ? transport.transports[config.transport]
    : transport.pickBest()

  var tableContext = {}
  var globalContext = {}

  var client = {
    addRecord: addRecord,
    clientTransport: clientTransport,
    config: config,
    createRecord: createRecord,
    getURL: getURL,
    globalContext: globalContext,
    sendRecord: sendRecord,
    setGlobalContext: setGlobalContext,
    setTableContext: setTableContext,
    tableContext: tableContext
  }
  return client

  // Given a tableName, generate a destination URL
  function getURL (tableName) {
    return config.protocol + '//' + config.pathname + config.database + '/' + tableName
  }

  // Create a record object
  function createRecord (tableName, values) {
    assert(
      isValidResourceName(tableName) && isObject(values),
      'invalid tableName or values'
    )
    return {
      apiKey: config.apiKey,
      data: object.assign({}, globalContext, tableContext[tableName], values),
      modified: date.now(),
      url: getURL(tableName)
    }
  }

  // Upload a record
  function sendRecord (record) {
    if (!clientTransport) {
      return false
    }

    const payload = clientTransport.prepare(record)
    if (!clientTransport.validate(payload)) {
      return false
    }

    return clientTransport.send(payload)
  }

  // Create a record and upload it to Treasure Data
  function addRecord (tableName, values) {
    var record = client.createRecord(tableName, values)
    return client.sendRecord(record)
  }

  // Set global context values
  function setGlobalContext (values) {
    assert(
      isObject(values),
      'invalid values'
    )
    object.assign(globalContext, values)
  }

  // Set table context values
  function setTableContext (tableName, values) {
    assert(
      isValidResourceName(tableName) && isObject(values),
      'invalid tableName or values'
    )
    if (!object.hasKey(tableContext, tableName)) {
      tableContext[tableName] = {}
    }
    object.assign(tableContext[tableName], values)
  }
}

module.exports = {
  createClient: createClient
}
