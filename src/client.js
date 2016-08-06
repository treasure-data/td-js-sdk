var utils = require('./utils')

var configValidators = {
  apiKey: utils.isString,
  database: utils.isResourceName,
  host: utils.isString,
  pathname: utils.isString
}

var tableNameAndValuesValidator = {
  tableName: utils.isResourceName,
  values: utils.isObject
}

var valuesValidator = {
  values: utils.isObject
}

// function createClientFactory (options) {
//   var defaultConfig = options.defaultConfig
//   // var location = window.document
//   // var protocol = location && location.protocol === HTTP
//   //   ? HTTP
//   //   : HTTPS
// }

var defaultConfig = {
  host: 'in.treasuredata.com',
  pathname: '/js/v3/event/'
}

function createClient (clientConfig) {
  var config = utils.assign({}, defaultConfig, clientConfig)
  utils.validate(configValidators, config)

  var apiKey = config.apiKey
  var endpoint = '//' + config.host + config.pathname + config.database + '/'
  var globalContext = {}
  var tableContext = {}
  // var plugins = {}

  return {
    // initialize: initialize,
    // apiKey: apiKey,
    createRecord: createRecord,
    // endpoint: endpoint,
    globalContext: globalContext,
    setGlobalContext: setGlobalContext,
    setTableContext: setTableContext,
    tableContext: tableContext
  }

  // function initialize () {

  // }

  // function addPlugin (name, plugin) {

  // }

  function createRecord (tableName, values) {
    utils.validate(tableNameAndValuesValidator, {
      tableName: tableName,
      values: values
    })
    return {
      apiKey: apiKey,
      data: utils.assign({}, globalContext, tableContext[tableName], values),
      modified: utils.now(),
      url: endpoint + tableName
    }
  }

  function setGlobalContext (values) {
    utils.validate(valuesValidator, { values: values })
    utils.assign(globalContext, values)
  }

  function setTableContext (tableName, values) {
    utils.validate(tableNameAndValuesValidator, {
      tableName: tableName,
      values: values
    })
    if (!utils.hasKey(tableContext, tableName)) {
      tableContext[tableName] = {}
    }
    utils.assign(tableContext[tableName], values)
  }
}

module.exports = {
  createClient: createClient
}
