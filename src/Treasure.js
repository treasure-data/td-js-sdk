var Cookies = require('js-cookie')
var assert = require('./lib/assert')
var assign = require('./lib/assign')
var defaultConfig = require('./defaultConfig')
var forEach = require('./lib/forEach')
var getIn = require('./lib/getIn')
var isObject = require('./lib/isObject')
var isString = require('./lib/isString')
var isValidResourceName = require('./lib/isValidResourceName')
var noop = require('./lib/noop')
var now = require('./lib/now')
var trim = require('./lib/trim')
var uuid4 = require('./lib/uuid4')
var transports = require('./transports')

function Treasure (inputConfig) {
  this.clientId = null
  this.config = Treasure.getConfig(inputConfig)
  this.globalContext = {}
  this.tableContext = {}
  this.transport = null
}

Treasure.getClientId = function getClientId (config) {
  return trim(
    config.clientId ||
    (config.cookieEnabled && Cookies.get(config.cookieName)) ||
    uuid4()
  ).replace(/\0/g, '')
}

Treasure.getConfig = function getConfig (inputConfig) {
  var config = assign({}, defaultConfig, inputConfig)
  assert(isString(config.apiKey), 'invalid apiKey')
  assert(isValidResourceName(config.database), 'invalid database')
  return config
}

Treasure.getTrackerData = function getTrackerData () {
  var data = {}
  console.log('trackerData', require('./trackerData'))
  forEach(require('./trackerData'), function (getValue, key) {
    data[key] = getValue()
  })
  return data
}

Treasure.getURL = function getURL (config, table) {
  assert(isValidResourceName(table), 'invalid table')
  return config.protocol + '//' + config.host + config.pathname + config.database + '/' + table
}

Treasure.setClientIdCookie = function (config, clientId) {
  if (!config.cookieEnabled) {
    return
  }

  var cookieDomain = config.cookieDomain
  var cookieExpires = config.cookieExpires
  var cookieName = config.cookieName
  var domainList = []

  if (cookieDomain === 'auto') {
    var hostname = getIn(window, 'location.hostname', '')
    var split = hostname.split('.')
    for (var index = split.length - 2; index >= 0; index--) {
      domainList.push(split.slice(index).join('.'))
    }
  } else {
    domainList.push(cookieDomain)
  }

  // Fallback value (empty domain) for localhost or IPs
  domainList.push('')

  // Try to set the cookie until a domain succeeds or the list is empty
  for (var i = 0; i < domainList.length; i++) {
    Cookies.set(cookieName, clientId, {
      domain: domainList[i],
      expires: cookieExpires
    })
    if (Cookies.get(cookieName) === clientId) {
      break
    }
  }
}

Treasure.prototype.buildRequestParams = function buildRequestParams (inputParams) {
  assert(isObject(inputParams.data), 'invalid data')
  assert(isValidResourceName(inputParams.table), 'invalid table')
  return {
    apiKey: inputParams.apiKey || this.config.apiKey,
    callback: inputParams.callback || noop,
    data: assign({}, this.globalContext, this.tableContext[inputParams.table], inputParams.data),
    modified: inputParams.modified || now(),
    sync: inputParams.sync === true,
    url: inputParams.url || Treasure.getURL(this.config, inputParams.table)
  }
}

Treasure.prototype.initialize = function initialize () {
  // Read or generate client id and set it on the instance
  this.clientId = Treasure.getClientId(this.config)

  // Try persisting the client id to a cookie
  Treasure.setClientIdCookie(this.config, this.clientId)

  // Get the transport
  this.transport = transports.getTransport(this.config.transport)
}

Treasure.prototype.send = function send (inputParams) {
  var requestParams = this.buildRequestParams(inputParams)
  this.transport.send(requestParams)
}

Treasure.prototype.sendEvent = function sendEvent (inputParams) {
  var params = assign({ table: this.config.eventsTable }, inputParams)
  params.data = assign({ td_client_id: this.clientId }, Treasure.getTrackerData(), params.data)
  this.send(params)
}

Treasure.prototype.sendPageview = function sendPageview (inputParams) {
  var params = assign({ table: this.config.pageviewsTable }, inputParams)
  this.sendEvent(params)
}

Treasure.prototype.setGlobalContext = function setGlobalContext (values) {
  assert(isObject(values), 'invalid values')
  assign(this.globalContext, values)
}

Treasure.prototype.setTableContext = function setTableContext (table, values) {
  assert(isValidResourceName(table), 'invalid table')
  assert(isObject(values), 'invalid values')
  if (!this.tableContext[table]) {
    this.tableContext[table] = {}
  }
  assign(this.tableContext[table], values)
}

Treasure.prototype.trackClicks = function trackClicks (inputParams) {
  var elementUtils = require('./lib/element')
  var addEventListener = elementUtils.addEventListener
  var getElementData = elementUtils.getElementData
  var getEventTarget = elementUtils.getEventTarget
  var shouldIgnoreElement = elementUtils.shouldIgnoreElement
  var treeHasIgnoreAttribute = elementUtils.treeHasIgnoreAttribute

  var instance = this
  var config = this.config
  var params = assign({
    element: window.document,
    extendClickData: defaultExtendClickData,
    ignoreAttribute: config.clicksIgnoreAttribute,
    table: config.clicksTable
  }, inputParams)

  return addEventListener(params.element, 'click', clickTracker)

  function clickTracker (event) {
    var target = getEventTarget(event)
    if (
      !treeHasIgnoreAttribute(params.ignoreAttribute) &&
      !shouldIgnoreElement(event, target)
    ) {
      var data = params.extendClickData(event, getElementData(target))
      if (isObject(data)) {
        instance.trackEvent({
          data: data,
          table: params.table
        })
      }
    }
  }
}

function defaultExtendClickData (event, data) {
  return data
}

module.exports = Treasure
