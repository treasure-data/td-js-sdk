/* global IntersectionObserver */
var _ = require('../utils/lodash')
var invariant = require('../utils/misc').invariant
var document = require('global/document')
var elementUtils = require('../utils/element')

var DEFAULT_CONFIG = {
  trackPageViews: false,
  trackClicks: false,
  trackElementViews: false
}

var PAGEVIEWS = 'at_pageviews'
var CLICKS = 'at_clicks'
var ELEMENT_VIEWS = 'at_element_views'

var isLinkOrButton = function isLinkOrButton (el) {
  var type = el.tagName

  return type === 'A' || type === 'BUTTON'
}

var configure = function configureAutoTracking () {}

var initAutoTracking = function initAutoTracking (config) {
  config = config || {}

  this.automatedTrackingConfig = _.assign(DEFAULT_CONFIG, config)

  var errorHandler = this.automatedTrackingConfig.errorHandler || _.noop

  if (this.automatedTrackingConfig.trackPageViews) {
    this.trackEvent(PAGEVIEWS, {}, _.noop, errorHandler)
  }

  if (this.automatedTrackingConfig.trackClicks) {
    var clickHandler = function autoClickHandler (evt) {
      var target = elementUtils.findElement(elementUtils.getEventTarget(evt))
      var treeHasIgnoreAttribute = elementUtils
        .createTreeHasIgnoreAttribute(elementUtils.ignoreAttribute)

      if (target && isLinkOrButton(target) && !treeHasIgnoreAttribute(target)) {
        var elementData = elementUtils.getElementData(target)

        if (config.extendClickData && _.isFunction(config.extendClickData)) {
          elementData = config.extendClickData(evt, elementData)
        }

        invariant(elementData, 'Automated click tracking, there is no data to record')
        this.trackEvent(CLICKS, elementData, _.noop, errorHandler)
      }
    }

    if (!this.trackClicksRemover) {
      this.trackClicksRemover = elementUtils.addEventListener(document, 'click', clickHandler.bind(this))
    }
  }

  if (this.automatedTrackingConfig.trackElementViews) {
    if (typeof IntersectionObserver !== 'undefined') {
      var observerOptions = {
        threshold: 1.0
      }

      var intersectionHandler = function intersectionHandler (entries, observer) {
        _.forEach(entries, function (entry) {
          if (entry.isIntersecting) {
            var elementData = elementUtils.getElementData(entry.target)

            invariant(elementData, 'Automated element view tracking, there is no data to record')
            this.trackEvent(ELEMENT_VIEWS, elementData, _.noop, errorHandler)
          }
        }, this)
      }

      var observer = new IntersectionObserver(intersectionHandler.bind(this), observerOptions)
      var trackedElements = document.querySelectorAll('.td-track-element-view')
      _.forEach(trackedElements, function (el) {
        observer.observe(el)
      })

      this.intersectionObserver = observer
    }
  }
}

var removeAutomatedClicksTracking = function () {
  if (this.trackClicksRemover) {
    this.trackClicksRemover()
  }
  this.automatedTrackingConfig.trackClicks = false
}

var removeAutomatedElementViewsTracking = function () {
  if (this.intersectionObserver) {
    this.intersectionObserver.disconnect()
  }
  this.automatedTrackingConfig.trackElementViews = false
}

module.exports = {
  initAutoTracking: initAutoTracking,
  configure: configure,
  removeAutoClicksTracking: removeAutomatedClicksTracking,
  removeAutoElementViewsTracking: removeAutomatedElementViewsTracking
}
