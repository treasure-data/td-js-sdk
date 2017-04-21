var jsonp = require('jsonp')
var noop = require('../utils/misc').noop
var invariant = require('../utils/misc').invariant

function fetchUserSegments (audienceToken, successCallback, errorCallback) {
  successCallback = successCallback || noop
  errorCallback = errorCallback || noop

  invariant(
    typeof audienceToken === 'string',
    'audienceToken must be a string; received "' + audienceToken.toString() + '"'
  )

  jsonp('https://cdp.in.treasuredata.com/cdp/lookup/collect/segments?token=' + audienceToken, {
    prefix: 'TreasureJSONPCallback',
    timeout: 10000
  }, function (err, res) {
    return err ? errorCallback(err) : successCallback(res && res.key, res && res.values)
  })
}

module.exports = {
  configure: noop,
  fetchUserSegments: fetchUserSegments
}
