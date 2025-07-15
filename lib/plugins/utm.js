var _ = require('../../lib/utils/lodash')

function collectUTMParameters() {
  var searchString = window.location.search
  var searchParams = new URLSearchParams(searchString)

  var utmParams = [
    'utm_id',
    'utm_medium',
    'utm_source_platform',
    'utm_source',
    'utm_campaign',
    'utm_marketing_tactic'
  ]

  return utmParams.reduce(function(acc, value) {
    var paramObj = {}
    paramObj[value] = searchParams.get(value)

    return Object.assign(acc, paramObj)
  }, {})
}

exports.configure = function() {
  var collectedUTMParams = collectUTMParameters()

  if (!_.isEmpty(collectedUTMParams) && _.isObject(collectedUTMParams)) {

    Object.keys(collectedUTMParams).forEach(
      function (paramName) {
        this.set('$global', paramName, collectedUTMParams[paramName])
      }.bind(this)
    )
  }
}
