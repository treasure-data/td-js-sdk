/**
 * @enum {string}
 */
var ProtocolType = { // eslint-disable-line no-unused-vars
  HTTP: 'http:',
  HTTPS: 'https:'
}

/**
 * @enum {string}
 */
var TransportType = { // eslint-disable-line no-unused-vars
  AUTO: 'auto',
  BEACON: 'beacon',
  JSONP: 'jsonp',
  XHR: 'xhr'
}

/**
 * @record
 */
function RequestParams () {}

/** @type {string} */
RequestParams.prototype.apiKey

/** @type {!(function (?Error, boolean): void)} */
RequestParams.prototype.callback

/** @type {!IObject<string, *>} */
RequestParams.prototype.data

/** @type {number} */
RequestParams.prototype.modified

/** @type {boolean} */
RequestParams.prototype.sync

/** @type {string} */
RequestParams.prototype.url

/**
 * @record
 */
function TrackEventInput () {}

/** @type {undefined|string} */
TrackEventInput.prototype.apiKey

/** @type {undefined|!(function (?Error, boolean): void)} */
TrackEventInput.prototype.callback

/** @type {undefined|?IObject<string, *>} */
TrackEventInput.prototype.data

/** @type {undefined|number} */
TrackEventInput.prototype.modified

/** @type {undefined|boolean} */
TrackEventInput.prototype.sync

/** @type {undefined|string} */
TrackEventInput.prototype.table

/**
 * @record
 */
function SendInput () {}

/** @type {undefined|string} */
SendInput.prototype.apiKey

/** @type {undefined|!(function (?Error, boolean): void)} */
SendInput.prototype.callback

/** @type {!IObject<string, *>} */
SendInput.prototype.data

/** @type {undefined|number} */
SendInput.prototype.modified

/** @type {undefined|boolean} */
SendInput.prototype.sync

/** @type {string} */
SendInput.prototype.table

/**
 * @record
 */
function TrackerContext () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_charset = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_color = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_ip = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_language = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_platform = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_referrer = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_screen = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_title = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_url = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_user_agent = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_version = function () {}

/**
 * @return {!(function (): string)}
 */
TrackerContext.prototype.td_viewport = function () {}

/**
 * @record
 */
function TrackerData () {}

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_charset

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_color

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_ip

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_language

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_platform

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_referrer

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_screen

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_title

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_url

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_user_agent

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_version

/**
 * @nocollapse
 * @type {string}
 */
TrackerData.prototype.td_viewport

/**
 * @record
 */
function Transport () {}

/** @type {undefined|Object} */
Transport.prototype.config

/** @return {boolean} */
Transport.prototype.isActive = function () {}

/** @type {string} */
Transport.prototype.name

/** @param {!RequestParams} requestParams */
Transport.prototype.send = function (requestParams) {}

/**
 * @record
 */
function TreasureConfig () {}

/** @type {string} */
TreasureConfig.prototype.apiKey

/** @type {string} */
TreasureConfig.prototype.clicksIgnoreAttribute

/** @type {string} */
TreasureConfig.prototype.clicksTable

/** @type {?string} */
TreasureConfig.prototype.clientId

/** @type {string} */
TreasureConfig.prototype.cookieDomain

/** @type {boolean} */
TreasureConfig.prototype.cookieEnabled

/** @type {number} */
TreasureConfig.prototype.cookieExpires

/** @type {string} */
TreasureConfig.prototype.cookieName

/** @type {string} */
TreasureConfig.prototype.database

/** @type {string} */
TreasureConfig.prototype.eventsTable

/** @type {string} */
TreasureConfig.prototype.host

/** @type {string} */
TreasureConfig.prototype.pageviewsTable

/** @type {string} */
TreasureConfig.prototype.pathname

/** @type {!ProtocolType} */
TreasureConfig.prototype.protocol

/** @type {!TransportType} */
TreasureConfig.prototype.transport

/**
 * @record
 */
function TreasureDefaults () {}

/** @type {string} */
TreasureDefaults.prototype.clicksIgnoreAttribute

/** @type {string} */
TreasureDefaults.prototype.clicksTable

/** @type {?string} */
TreasureDefaults.prototype.clientId

/** @type {string} */
TreasureDefaults.prototype.cookieDomain

/** @type {boolean} */
TreasureDefaults.prototype.cookieEnabled

/** @type {number} */
TreasureDefaults.prototype.cookieExpires

/** @type {string} */
TreasureDefaults.prototype.cookieName

/** @type {string} */
TreasureDefaults.prototype.eventsTable

/** @type {string} */
TreasureDefaults.prototype.host

/** @type {string} */
TreasureDefaults.prototype.pageviewsTable

/** @type {string} */
TreasureDefaults.prototype.pathname

/** @type {!ProtocolType} */
TreasureDefaults.prototype.protocol

/** @type {!TransportType} */
TreasureDefaults.prototype.transport

/**
 * @record
 */
function TreasureInput () {}

/** @type {string} */
TreasureInput.prototype.apiKey

/** @type {undefined|string} */
TreasureInput.prototype.clicksIgnoreAttribute

/** @type {undefined|string} */
TreasureInput.prototype.clicksTable

/** @type {undefined|?string} */
TreasureInput.prototype.clientId

/** @type {undefined|string} */
TreasureInput.prototype.cookieDomain

/** @type {undefined|boolean} */
TreasureInput.prototype.cookieEnabled

/** @type {undefined|number} */
TreasureInput.prototype.cookieExpires

/** @type {undefined|string} */
TreasureInput.prototype.cookieName

/** @type {string} */
TreasureInput.prototype.database

/** @type {undefined|string} */
TreasureInput.prototype.eventsTable

/** @type {undefined|string} */
TreasureInput.prototype.host

/** @type {undefined|string} */
TreasureInput.prototype.pageviewsTable

/** @type {undefined|string} */
TreasureInput.prototype.pathname

/** @type {undefined|!ProtocolType} */
TreasureInput.prototype.protocol

/** @type {undefined|!TransportType} */
TreasureInput.prototype.transport

module.exports = {
  RequestParams: RequestParams,
  SendInput: SendInput,
  TrackerContext: TrackerContext,
  TrackerData: TrackerData,
  TrackEventInput: TrackEventInput,
  Transport: Transport,
  TransportType: TransportType,
  TreasureConfig: TreasureConfig,
  TreasureDefaults: TreasureDefaults,
  TreasureInput: TreasureInput
}
