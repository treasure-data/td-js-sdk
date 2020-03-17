var simple = require('simple-mock')
var expect = require('expect.js')
var Treasure = require('../lib/treasure')

describe('Automated traking', function () {
  var treasure, configuration

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false
    }
  }

  beforeEach(resetConfiguration)
  beforeEach(function () {
    treasure = new Treasure(configuration)
  })

  afterEach(function () {
    simple.restore()
  })

  describe('#configure', function () {
    it('should call configure', function () {
      var configSpy = simple.mock(Treasure.Plugins.Track, 'configure')
      treasure = new Treasure(configuration)

      expect(configSpy.callCount).to.equal(1)
      expect(configSpy.firstCall.args).to.have.length(1)
      simple.restore()
    })

    it('should set default configs', function () {
      treasure = new Treasure(configuration)

      treasure.initAutoTracking()
      expect(treasure.automatedTrackingConfig).to.be.ok()
      expect(treasure.automatedTrackingConfig.trackPageViews).to.be(false)
      expect(treasure.automatedTrackingConfig.trackClicks).to.be(false)
      expect(treasure.automatedTrackingConfig.trackElementViews).to.be(false)
    })

    it('should set config correctly', function () {
      treasure = new Treasure(configuration)

      treasure.initAutoTracking({ trackPageViews: true, trackClicks: true, trackElementViews: true })
      expect(treasure.automatedTrackingConfig).to.be.ok()
      expect(treasure.automatedTrackingConfig.trackPageViews).to.be(true)
      expect(treasure.automatedTrackingConfig.trackClicks).to.be(true)
      expect(treasure.automatedTrackingConfig.trackElementViews).to.be(true)
    })
  })

  describe('remove automated tracking', function () {
    it('remove auto clicks tracking', function () {
      treasure = new Treasure(configuration)

      treasure.initAutoTracking({ trackPageViews: false, trackClicks: true, trackElementViews: false })
      expect(treasure.automatedTrackingConfig).to.be.ok()
      expect(treasure.automatedTrackingConfig.trackClicks).to.be(true)

      treasure.removeAutoClicksTracking()
      console.log(treasure.automatedTrackingConfig)
      expect(treasure.automatedTrackingConfig.trackClicks).to.be(false)
    })
    it('remove auto element views tracking', function () {
      treasure = new Treasure(configuration)

      treasure.initAutoTracking({ trackPageViews: false, trackClicks: false, trackElementViews: true })
      expect(treasure.automatedTrackingConfig).to.be.ok()
      expect(treasure.automatedTrackingConfig.trackElementViews).to.be(true)

      treasure.removeAutoElementViewsTracking()
      expect(treasure.automatedTrackingConfig.trackElementViews).to.be(false)
    })
  })
})
