var window = require('global/window')
var getIn = require('./lib/getIn')

// /** @const */
// var TreasureDefaults = require('./types').TreasureDefaults // eslint-disable-line no-unused-vars

/**
 * @nocollapse
 * @struct
 * @type {!TreasureDefaults}
 */
module.exports = {
  clicksIgnoreAttribute: 'td-ignore',
  clicksTable: 'clicks',
  clientId: null,
  cookieDomain: 'auto',
  cookieEnabled: getIn(window, 'navigator.cookieEnabled', true),
  cookieExpires: 730, // 2 years
  cookieName: '_td',
  eventsTable: 'events',
  host: 'in.treasuredata.com',
  pageviewsTable: 'pageviews',
  pathname: '/js/v3/event/',
  protocol: getIn(window, 'location.protocol') === 'http:' ? 'http:' : 'https:',
  transport: 'auto'
}
