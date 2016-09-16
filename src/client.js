var defaultConfig = require('./defaultConfig')
var assert = require('./lib/assert')
var assign = require('./lib/assign')
var isObject = require('./lib/isObject')
var isString = require('./lib/isString')
var isValidResourceName = require('./lib/isValidResourceName')
// var noop = require('./lib/noop')
var now = require('./lib/now')
var Transport = require('./transport')

module.exports = function createClient (clientConfig) {
  var config = assign({}, defaultConfig, clientConfig)

  // Backwards compatibility
  if (config.writeKey) {
    config.apikey = config.writeKey
  }

  invalidInvariant(isString(config.apiKey), 'apiKey')
  invalidInvariant(isValidResourceName(config.database), 'database')

  var transport = config.transport
    ? Transport.transports[config.transport]
    : Transport.pickBest()

  var tableContext = {}
  var globalContext = {}

  var client = {
    addRecord: addRecord,
    transport: transport,
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

  /**
   * Given a tableName, generate a destination URL
   * @param {string} tableName
   * @return {string}
   */
  function getURL (tableName) {
    tableInvariant(tableName)
    return config.protocol + '//' + config.host + config.pathname + config.database + '/' + tableName
  }

  /**
   * Create a record object
   * @param {string} tableName
   * @param {Object} values
   */
  function createRecord (tableName, values) {
    tableInvariant(tableName)
    valuesInvariant(values)
    return {
      apiKey: config.apiKey,
      data: assign({}, globalContext, tableContext[tableName], values),
      modified: now(),
      url: getURL(tableName)
    }
  }

  /**
   * Upload a record
   * @return {boolean}
   */
  function sendRecord (record) {
    if (!transport) {
      return false
    }

    var payload = transport.prepare(record)
    if (!transport.validate(payload)) {
      return false
    }

    return transport.send(payload)
  }

  /**
   * Create a record and upload it to Treasure Data
   * @param {string} tableName
   */
  function addRecord (tableName, values) {
    var record = client.createRecord(tableName, values)
    return client.sendRecord(record)
  }

  /**
   * Set global context values
   * @param {Object} values
   */
  function setGlobalContext (values) {
    valuesInvariant(values)
    assign(globalContext, values)
  }

  /**
   * Set table context values
   * @param {string} tableName
   * @param {Object} values
   */
  function setTableContext (tableName, values) {
    tableInvariant(tableName)
    valuesInvariant(values)
    if (!tableContext[tableName]) {
      tableContext[tableName] = {}
    }
    assign(tableContext[tableName], values)
  }
}

// Assertion helpers
function invalidInvariant (value, name) {
  assert(value, 'invalid ' + name)
}

function tableInvariant (tableName) {
  invalidInvariant(isValidResourceName(tableName), 'table')
}

function valuesInvariant (values) {
  invalidInvariant(isObject(values), 'values')
}
