var window = require('global/window')
var object = require('./lib/object')

var protocol = object.getIn(window, 'location.protocol') === 'http:'
  ? 'http:'
  : 'https:'

module.exports = {
  clicksTable: 'clicks',
  cookieDomain: null,
  cookieExpiresDays: 730, // 2 years
  cookieName: '_td',
  cookiePath: '/',
  development: false,
  host: 'in.treasuredata.com',
  pageviewsTable: 'pageviews',
  pathname: '/js/v3/event/',
  protocol: protocol
}
