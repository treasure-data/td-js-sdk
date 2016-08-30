var window = require('global/window')
var object = require('./lib/object')

var protocol = object.getIn(window, 'document.location.protocol') === 'http:'
  ? 'http:'
  : 'https:'

module.exports = {
  cookieDomain: null,
  cookieExpiresDays: 730, // 2 years
  cookieName: '_td',
  cookiePath: '/',
  disableLocalCookie: false,
  eventsTable: 'events',
  host: 'in.treasuredata.com',
  pageviewsTable: 'pageviews',
  pathname: '/js/v3/event/',
  protocol: protocol
}
