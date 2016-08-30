var date = require('./lib/date')
var lang = require('./lib/lang')
var object = require('./lib/object')
var isValidResourceName = require('./lib/string').isValidResourceName
var assert = require('./lib/utils').assert
var transport = require('./transport')
var isObject = lang.isObject
var isString = lang.isString

function createClient (defaultConfig, clientConfig) {
  var config = object.assign({}, defaultConfig, clientConfig)
  assert(
    isValidResourceName(config.database) && isString(config.apiKey),
    'invalid database or apikey'
  )

  var clientTransport = config.transport
    ? transport.transports[config.transport]
    : transport.pickBest()

  var client = {
    _apiKey: config.apiKey,
    _config: config,
    _createRecord: _createRecord,
    _database: config.database,
    _getURL: _getURL,
    _globalContext: {},
    _host: config.host,
    _pathname: config.pathname,
    _protocol: config.protocol,
    _sendRecord: _sendRecord,
    _tableContext: {},
    _transport: clientTransport,
    addRecord: addRecord,
    setGlobalContext: setGlobalContext,
    setTableContext: setTableContext
  }
  return client

  // Given a tableName, generate a destination URL
  function _getURL (tableName) {
    return client._protocol + '//' + client._pathname + client._database + '/' + tableName
  }

  // Create a record object
  function _createRecord (tableName, values) {
    assert(
      isValidResourceName(tableName) && isObject(values),
      'invalid tableName or values'
    )
    return {
      apiKey: client._apiKey,
      data: object.assign({}, client._globalContext, client._tableContext[tableName], values),
      modified: date.now(),
      url: client._getURL(tableName)
    }
  }

  // Upload a record
  function _sendRecord (record) {
    if (!client._transport) {
      return false
    }

    const payload = client._transport.prepare(record)
    if (!client.transport.validate(payload)) {
      return false
    }

    return client._transport.send(payload)
  }

  // Create a record and upload it to Treasure Data
  function addRecord (tableName, values) {
    return client._sendRecord(
      client._createRecord(tableName, values)
    )
  }

  // Set global context values
  function setGlobalContext (values) {
    assert(isObject(values), 'invalid values')
    object.assign(client._globalContext, values)
  }

  // Set table context values
  function setTableContext (tableName, values) {
    assert(
      isValidResourceName(tableName) && isObject(values),
      'invalid tableName or values'
    )
    if (!object.hasKey(client._tableContext, tableName)) {
      client._tableContext[tableName] = {}
    }
    object.assign(client._tableContext[tableName], values)
  }
}

module.exports = {
  createClient: createClient
}
