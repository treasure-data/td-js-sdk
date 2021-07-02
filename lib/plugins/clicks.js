var window = require('global/window')
var elementUtils = require('../utils/element')
var assign = require('../utils/lodash').assign
var disposable = require('../utils/misc').disposable

function defaultExtendClickData (event, data) {
  return data
}

function configure () {
  this._clickTrackingInstalled = false
}

/**
 * Setup an event listener to automatically log clicks.
 * The event will be hooked only follows
 * - `role=button` or `role=link`
 * - `<a>`
 * - `<button>`
 * - `<input>)`. exclude for `<input type='password'>`
 *
 * @param    {object}   trackClickOptions - object containing configuration information
 * @property {string}   element           - Default is window.document. Default setting will observe all elements above. You can set an element if you want to focus on a particular element.
 * @property {function} extendClickData   - Default is function to set element attributes. You can set function adding special tracking data by extending function(e: event, elementData: ElementObject).
 * @property {string}   ignoreAttribute   - Default is "td-ignore" You can set attribute name to ignore element. (e.g. <span role='button' class='button-design' id='button-id' td-ignore />)
 * @property {string}   tableName         - Default tableName is "clicks". Click tracking event will be stored into tableName in TreasureData
 *
 * @example
 * var td = new Treasure({...})
 * td.trackClicks({
 *     element         : '...'
 *     extendClickData : '...'
 *     ignoreAttribute : '...'
 *     tableName       : '...'
 *     })
 *
 */
function trackClicks (trackClicksOptions) {
  if (this._clickTrackingInstalled) return

  var instance = this
  var options = assign({
    element: window.document,
    extendClickData: defaultExtendClickData,
    ignoreAttribute: 'td-ignore',
    tableName: 'clicks'
  }, trackClicksOptions)

  var treeHasIgnoreAttribute = elementUtils
    .createTreeHasIgnoreAttribute(options.ignoreAttribute)

  var removeClickTracker = elementUtils
    .addEventListener(options.element, 'click', clickTracker)

  instance._clickTrackingInstalled = true
  return disposable(function () {
    removeClickTracker()
    instance._clickTrackingInstalled = false
  })

  function clickTracker (e) {
    var target = elementUtils.findElement(elementUtils.getEventTarget(e))
    if (
      target &&
      !treeHasIgnoreAttribute(target)
    ) {
      var elementData = elementUtils.getElementData(target)
      var data = options.extendClickData(e, elementData)
      if (data) {
        instance.trackEvent(options.tableName, data)
      }
    }
  }
}

module.exports = {
  configure: configure,
  trackClicks: trackClicks
}
