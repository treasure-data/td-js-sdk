var assert = require('./lib/assert')
var assign = require('./lib/assign')
var getIn = require('./lib/getIn')
var isObject = require('./lib/isObject')
var isString = require('./lib/isString')
var isValidResourceName = require('./lib/isValidResourceName')

// /** @const */
// var RequestParams = require('./types').RequestParams // eslint-disable-line no-unused-vars

// /** @const */
// var SendInput = require('./types').SendInput // eslint-disable-line no-unused-vars

// /** @const */
// var TrackEventInput = require('./types').TrackEventInput // eslint-disable-line no-unused-vars

// /** @const */
// var Transport = require('./types').Transport // eslint-disable-line no-unused-vars

// /** @const */
// var TreasureConfig = require('./types').TreasureConfig // eslint-disable-line no-unused-vars

// /** @const */
// var TreasureInput = require('./types').TreasureInput // eslint-disable-line no-unused-vars

/**
 * @param {!TreasureInput} inputConfig
 * @constructor
 */
function Treasure (inputConfig) {
  /**
   * @nocollapse
   * @type {?string}
   */
  this.clientId = null

  /**
   * @nocollapse
   * @type {!TreasureConfig}
   */
  this.config = Treasure.getConfig(inputConfig)

  /**
   * @nocollapse
   * @type {!IObject<string, *>}
   */
  this.globalContext = {}

  /**
   * @nocollapse
   * @type {!IObject<string, !IObject<string, *>>}
   */
  this.tableContext = {}

  /**
   * @nocollapse
   * @type {?Transport}
   */
  this.transport = null
}

/**
 * @param {!TreasureConfig} config
 * @return {string}
 */
Treasure.getClientId = function getClientId (config) {
  var trim = require('./lib/trim')
  return trim(
    config.clientId ||
    (config.cookieEnabled && require('js-cookie').get(config.cookieName)) ||
    require('./lib/uuid4')()
  ).replace(/\0/g, '')
}

/**
 * @param {!TreasureInput} inputConfig
 * @return {!TreasureConfig}
 */
Treasure.getConfig = function getConfig (inputConfig) {
  /**
   * type {TreasureConfig}
   */
  var defaultConfig = require('./defaultConfig')
  var config = assign({}, defaultConfig, inputConfig)
  assert(isString(config.apiKey), 'invalid apiKey')
  assert(isValidResourceName(config.database), 'invalid database')
  return config
}

/**
 * @param {!TreasureConfig} config
 * @param {string} table
 * @return {string}
 */
Treasure.getURL = function getURL (config, table) {
  assert(isValidResourceName(table), 'invalid table')
  return config.protocol + '//' + config.host + config.pathname + config.database + '/' + table
}

/**
 * @param {!TreasureConfig} config
 * @param {string} clientId
 */
Treasure.setClientIdCookie = function (config, clientId) {
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
    require('js-cookie').set(cookieName, clientId, {
      domain: domainList[i],
      expires: cookieExpires
    })
    if (require('js-cookie').get(cookieName) === clientId) {
      break
    }
  }
}

/**
 * @param {SendInput} inputParams
 * @return {RequestParams}
 */
Treasure.prototype.buildRequestParams = function buildRequestParams (inputParams) {
  assert(isObject(inputParams.data), 'invalid data')
  assert(isValidResourceName(inputParams.table), 'invalid table')
  return {
    apiKey: inputParams.apiKey || this.config.apiKey,
    callback: inputParams.callback || require('./lib/noop'),
    data: assign({}, this.globalContext, this.tableContext[inputParams.table], inputParams.data),
    modified: inputParams.modified || require('./lib/now')(),
    sync: inputParams.sync === true,
    url: inputParams.url || Treasure.getURL(this.config, inputParams.table)
  }
}

/**
 * @private
 */
Treasure.prototype.initialize = function initialize () {
  // Read or generate client id and set it on the instance
  this.clientId = Treasure.getClientId(this.config)

  // Try persisting the client id to a cookie
  if (this.config.cookieEnabled) {
    Treasure.setClientIdCookie(this.config, this.clientId)
  }

  // Get the transport
  var transports = require('./transports')
  this.transport = transports.getTransport(this.config.transport)
}

/**
 * @param {SendInput} inputParams
 */
Treasure.prototype.send = function send (inputParams) {
  var requestParams = this.buildRequestParams(inputParams)
  if (this.transport) {
    this.transport.send(requestParams)
  }
}

/**
 * @param {TrackEventInput} inputParams
 */
Treasure.prototype.trackEvent = function trackEvent (inputParams) {
  /** @type {SendInput} */
  var params = assign({ data: {}, table: this.config.eventsTable }, inputParams)

  /** @type {!IObject<string, *>} */
  var trackerData = require('./trackerData')
  params.data = assign(trackerData.getTrackerData(), { td_client_id: this.clientId }, params.data)

  this.send(params)
}

/**
 * @param {?TrackEventInput} inputParams
 */
Treasure.prototype.trackPageview = function trackPageview (inputParams) {
  var params = assign({ data: {}, table: this.config.pageviewsTable }, inputParams)
  this.trackEvent(params)
}

/**
 * @param {{table: string, values: !IObject<string, *>}} inputParams
 */
Treasure.prototype.setGlobalContext = function setGlobalContext (inputParams) {
  assert(isObject(inputParams.values), 'invalid values')
  assign(this.globalContext, inputParams.values)
}

/**
 * @param {{table: string, values: !IObject<string, *>}} inputParams
 */
Treasure.prototype.setTableContext = function setTableContext (inputParams) {
  assert(isValidResourceName(inputParams.table), 'invalid table')
  assert(isObject(inputParams.values), 'invalid values')
  if (!this.tableContext[inputParams.table]) {
    this.tableContext[inputParams.table] = {}
  }
  assign(this.tableContext[inputParams.table], inputParams.values)
}

/**
 * @param {?{
 *   element: (!EventTarget|undefined),
 *   extendClickData: ((function (Event, !IObject<string, *>): ?IObject<string, *>)|undefined),
 *   ignoreAttribute: (string|undefined),
 *   table: (string|undefined)
 * }} inputParams
 * @return {Function}
 */
Treasure.prototype.trackClicks = function trackClicks (inputParams) {
  var elementUtils = require('./lib/element')
  var addEventListener = elementUtils.addEventListener
  var getElementData = elementUtils.getElementData
  var getEventTarget = elementUtils.getEventTarget
  var shouldIgnoreElement = elementUtils.shouldIgnoreElement
  var treeHasIgnoreAttribute = elementUtils.treeHasIgnoreAttribute

  var instance = this
  var params = assign({
    element: window.document,
    extendClickData: defaultExtendClickData,
    ignoreAttribute: this.config.clicksIgnoreAttribute,
    table: this.config.clicksTable
  }, inputParams)

  return addEventListener(params.element, 'click', clickTracker)

  /**
   * @param {Event} event
   */
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

/**
 * @param {Event} event
 * @param {!IObject<string, *>} data
 * @return {!IObject<string, *>}
 */
function defaultExtendClickData (event, data) {
  return data
}

/**
 * @const {string}
 */
Treasure.prototype.version = require('./version')

exports.Treasure = Treasure
