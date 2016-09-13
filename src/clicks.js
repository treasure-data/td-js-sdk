var window = require('global/window')
var assign = require('./lib/assign')
var element = require('./lib/element')

function defaultExtendClickData (event, data) {
  return data
}

module.exports = function createClicks (client, tracker) {
  var clicks = {
    installClickTracker: installClickTracker
  }
  return clicks

  function installClickTracker (clickTrackerOptions) {
    var options = assign({
      clicksTable: client.config.clicksTable,
      element: window.document,
      extendClickData: defaultExtendClickData,
      ignoreAttribute: client.config.clickIgnoreAttribute,
      shouldIgnoreElement: element.shouldIgnoreElement
    }, clickTrackerOptions)

    return element.addEventListener(options.element, 'click', clickTracker)

    function clickTracker (event) {
      var target = element.getEventTarget(event)
      if (
        !element.treeHasIgnoreAttribute(options.ignoreAttribute) &&
        !options.shouldIgnoreElement(event, target)
      ) {
        var elementData = element.getElementData(target)
        var data = options.extendClickData(event, elementData)
        tracker.trackEvent(options.clicksTable, data)
      }
    }
  }
}
