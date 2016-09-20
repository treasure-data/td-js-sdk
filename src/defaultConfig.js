var window = require('global/window')
var getIn = require('./lib/getIn')

module.exports = {
  clicksIgnoreAttribute: 'td-ignore',
  clicksTable: 'clicks',
  cookieDomain: 'auto',
  cookieEnabled: getIn(window, 'navigator.cookieEnabled', true),
  cookieExpires: 730, // 2 years
  cookieName: '_td',
  eventsTable: 'events',
  host: 'in.treasuredata.com',
  pageviewsTable: 'pageviews_test_cesar',
  pathname: '/js/v3/event/',
  protocol: getIn(window, 'location.protocol') === 'http:' ? 'http:' : 'https:',
  transport: 'auto'
}
