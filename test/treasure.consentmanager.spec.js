var simple = require('simple-mock')
var expect = require('chai').expect
var Treasure = require('../lib/treasure')
var noop = require('../lib/utils/lodash').noop

describe('Consent Manager', function () {
  var treasure, configuration

  function resetConfiguration () {
    configuration = {
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false,
      startInSignedMode: true,
      consentManager: {
        storageKey: 'a_key',
        consentTable: 'consent_table',
        contextTable: 'context_table',
        successConsentCallback: noop,
        failureConsentCallback: noop
      }
    }
  }

  beforeEach(resetConfiguration)
  describe('#configure', function () {
    it('should call configure', function () {
      var configSpy = simple.mock(Treasure.Plugins.ConsentManager, 'configure')
      treasure = new Treasure(configuration)

      expect(configSpy.callCount).to.equal(1)
      expect(configSpy.firstCall.args).to.have.length(1)
      expect(configSpy.firstCall.args[0]).to.be.an('object')

      simple.restore()
    })

    it('should be configured with correct values', function () {
      simple.mock(Treasure.Plugins.ConsentManager, 'configure')
      treasure = new Treasure(configuration)

      expect(treasure.consentManager.storageKey).to.equal('a_key')
      expect(treasure.consentManager.consentTable).to.equal('consent_table')
      expect(treasure.consentManager.contextTable).to.equal('context_table')
      expect(treasure.consentManager.successConsentCallback).to.equal(noop)
      expect(treasure.consentManager.failureConsentCallback).to.equal(noop)

      simple.restore()
    })
  })

  describe('#addContext', function () {
    it('should add nothing when passing no argument', function () {
      treasure = new Treasure(configuration)

      var contextId = treasure.addContext()
      expect(contextId).to.equal(undefined)
    })

    it('should add context', function () {
      treasure = new Treasure(configuration)

      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      expect(Object.keys(treasure.consentManager.preferences)).to.have.lengthOf(1)
      expect(treasure.consentManager.preferences[contextId].brand).to.equal('brand')
      expect(treasure.consentManager.preferences[contextId].domain_name).to.equal('domain')
      expect(treasure.consentManager.preferences[contextId].collection_type).to.equal('collection_type')
      expect(treasure.consentManager.preferences[contextId].collection_point_id).to.equal('collection_point_id')
    })
  })

  describe('#addConsent', function () {
    it('should add nothing when passing no argument', function () {
      treasure = new Treasure(configuration)

      var contextId = treasure.addConsents()
      expect(contextId).to.equal(undefined)
    })

    it('should add consent', function () {
      treasure = new Treasure(configuration)
      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.addConsents({
        'a purpose': {
          status: 'given',
          context_id: contextId
        }
      })

      expect(Object.keys(treasure.consentManager.preferences[contextId].consents)).to.have.lengthOf(1)
      expect(treasure.consentManager.preferences[contextId].consents['a purpose'].status).to.equal('given')
    })
    it('should add consent to default context', function () {
      treasure = new Treasure(configuration)
      treasure.addConsents({
        'a purpose': {
          status: 'given'
        }
      })

      var defaultContextId = Object.keys(treasure.consentManager.preferences)[0]

      expect(treasure.consentManager.preferences[defaultContextId].collection_type).to.equal(document.location.hostname)
      expect(Object.keys(treasure.consentManager.preferences[defaultContextId].consents)).to.have.lengthOf(1)
      expect(treasure.consentManager.preferences[defaultContextId].consents['a purpose'].status).to.equal('given')
    })
  })

  describe('#update', function () {
    it('updateContext: should not update context when context id is empty', function () {
      treasure = new Treasure(configuration)
      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.updateContext()

      expect(treasure.consentManager.preferences[contextId].collection_type).to.equal('collection_type')
      expect(treasure.consentManager.preferences[contextId].collection_point_id).to.equal('collection_point_id')
    })
    it('updateContext: should update context', function () {
      treasure = new Treasure(configuration)
      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain.com',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.updateContext(contextId, {
        brand: 'new brand',
        domain_name: 'newdomain.com',
        collection_type: 'new_collection_type',
        collection_point_id: 'new_collection_point_id'
      })

      expect(treasure.consentManager.preferences[contextId].brand).to.equal('new brand')
      expect(treasure.consentManager.preferences[contextId].domain_name).to.equal('newdomain.com')
      expect(treasure.consentManager.preferences[contextId].collection_type).to.equal('new_collection_type')
      expect(treasure.consentManager.preferences[contextId].collection_point_id).to.equal('new_collection_point_id')
    })

    it('updateConsent: should not update consent when no value passed or no context id', function () {
      treasure = new Treasure(configuration)
      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.addConsents({
        'purpose': {
          status: 'refused',
          context_id: contextId
        }
      })

      treasure.updateConsent(contextId)

      expect(treasure.consentManager.preferences[contextId].consents['purpose'].status).to.equal('refused')
      expect(treasure.consentManager.preferences[contextId].consents['purpose']['context_id']).to.equal(contextId)

      // no context id
      treasure.updateConsent()
      expect(treasure.consentManager.preferences[contextId].consents['purpose'].status).to.equal('refused')
      expect(treasure.consentManager.preferences[contextId].consents['purpose']['context_id']).to.equals(contextId)
    })

    it('updateConsent: should update consent in a specific context', function () {
      treasure = new Treasure(configuration)
      var contextId = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.addConsents({
        'purpose': {
          status: 'refused',
          context_id: contextId
        }
      })

      treasure.updateConsent(contextId, {
        purpose: {
          status: 'given'
        }
      })

      expect(treasure.consentManager.preferences[contextId].consents['purpose'].status).to.equal('given')
      expect(treasure.consentManager.preferences[contextId].consents['purpose']['context_id']).to.equal(contextId)
    })
  })
  describe('#get info', function () {
    it('should return correct contexts', function () {
      treasure = new Treasure(configuration)
      var contextId1 = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })
      var contextId2 = treasure.addContext({
        brand: 'brand2',
        domain_name: 'domain2',
        collection_type: 'collection_type2',
        collection_point_id: 'collection_point_id2'
      })

      var contexts = treasure.getContexts()
      expect(contexts).to.have.length(2)
      expect(contexts).to.be.an('array')

      expect(contexts).to.have.deep.members([
        {
          brand: 'brand',
          domain_name: 'domain',
          collection_type: 'collection_type',
          collection_point_id: 'collection_point_id',
          context_id: contextId1
        },

        {
          brand: 'brand2',
          domain_name: 'domain2',
          collection_type: 'collection_type2',
          collection_point_id: 'collection_point_id2',
          context_id: contextId2
        }
      ])
    })
    it('should return correct consents', function () {
      treasure = new Treasure(configuration)
      var contextId1 = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.addConsents({
        'purpose 1': {
          status: 'given',
          context_id: contextId1
        },
        'purpose 2': {
          status: 'refused',
          context_id: contextId1
        }
      })

      var contextId2 = treasure.addContext({
        brand: 'brand2',
        domain_name: 'domain2',
        collection_type: 'collection_type2',
        collection_point_id: 'collection_point_id2'
      })
      treasure.addConsents({
        'purpose 3': {
          status: 'given',
          context_id: contextId2
        }
      })

      var consents = treasure.getConsents()
      expect(consents.length).to.equal(3)
      expect(consents).to.have.deep.members([
        {
          brand: 'brand',
          domain_name: 'domain',
          collection_type: 'collection_type',
          collection_point_id: 'collection_point_id',
          context_id: contextId1,
          status: 'given',
          datatype: '',
          description: '',
          expiry_date: '',
          purpose: 'purpose 1',
          identifier: treasure.client.track.uuid
        },
        {
          brand: 'brand',
          domain_name: 'domain',
          collection_type: 'collection_type',
          collection_point_id: 'collection_point_id',
          context_id: contextId1,
          status: 'refused',
          datatype: '',
          description: '',
          expiry_date: '',
          purpose: 'purpose 2',
          identifier: treasure.client.track.uuid
        },
        {
          brand: 'brand2',
          domain_name: 'domain2',
          collection_type: 'collection_type2',
          collection_point_id: 'collection_point_id2',
          context_id: contextId2,
          status: 'given',
          datatype: '',
          description: '',
          expiry_date: '',
          purpose: 'purpose 3',
          identifier: treasure.client.track.uuid
        }
      ])
    })
  })

  describe('#storage', function () {
    it('should store preferences correctly', function () {
      treasure = new Treasure(configuration)
      var contextId1 = treasure.addContext({
        brand: 'brand',
        domain_name: 'domain',
        collection_type: 'collection_type',
        collection_point_id: 'collection_point_id'
      })

      treasure.addConsents({
        'purpose 1': {
          status: 'given',
          context_id: contextId1
        },
        'purpose 2': {
          status: 'refused',
          context_id: contextId1
        }
      })

      var contextId2 = treasure.addContext({
        brand: 'brand2',
        domain_name: 'domain2',
        collection_type: 'collection_type2',
        collection_point_id: 'collection_point_id2'
      })
      treasure.addConsents({
        'purpose 3': {
          status: 'given',
          context_id: contextId2
        }
      })

      treasure.saveConsents()

      var preferences = treasure.getPreferences()
      expect(Object.keys(preferences)).to.have.lengthOf(2)
      expect(preferences[contextId1].brand).to.equal('brand')
      expect(Object.keys(preferences[contextId1].consents)).to.have.lengthOf(2)

      expect(preferences[contextId2].brand).to.equal('brand2')
      expect(Object.keys(preferences[contextId2].consents)).to.have.lengthOf(1)
    })
  })
})
