import _ from '../utils/lodash'
import dayjs from 'dayjs'
import global from 'global'
import generateUUID from '../utils/generateUUID'
import { cammelCase } from '../utils/misc'

const COOKIE_NAME = 'td_consent_preferences'
const DEFAULT_CONSENT_TABLE = 'td_cm_consent'
const DEFAULT_CONTEXT_TABLE = 'td_cm_context'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_ISSUER = 'treasuredata'
const CONSENT_STATES = {
  GIVEN: 'given',
  REJECTED: 'rejected',
  NOTGIVEN: 'notgiven'
}

export default {
  // setup consent manager
  configure (options = {}) {
    const consentManager = options.consentManager || {}
    const hostname = document.location.hostname

    const {
      storageKey = COOKIE_NAME,
      consentTable = DEFAULT_CONSENT_TABLE,
      contextTable = DEFAULT_CONTEXT_TABLE,
      successConsentCallback = _.noop,
      failureConsentCallback = _.noop,
      expiredConsentsCallback = _.noop,
      dateFormat = DEFAULT_DATE_FORMAT,
      issuer = DEFAULT_ISSUER,
      container
    } = consentManager

    this.defaultContext = {
      brand: hostname,
      domain_name: hostname,
      collection_type: hostname,
      collection_point_id: hostname,
      context_id: generateUUID(),
      consents: {}
    }

    this.consentManager = {
      storageKey,
      successConsentCallback,
      failureConsentCallback,
      expiredConsentsCallback,
      consentTable,
      contextTable,
      dateFormat,
      issuer,
      container
    }

    this.consentManager.preferences = this.getPreferences() || {}

    this.consentManager.expiredConsentsCallback(this.getExpiredConsents())
  },

  _getContainer (selector) {
    if (_.isString(selector)) {
      return document.querySelector(selector)
    } else if (_.isObject(selector)) {
      return selector
    }

    return document.body
  },

  _getNormalizedConsent (consentKey, consent) {
    return {
      description: consent.description,
      datatype: consent.datatype,
      status: consent.status,
      expriry_date: consent.expiry_date || null,
      issuer: this.consentManager.issuer,
      identifier: this.client.track.uuid,
      purpose: consentKey,
      context_id: consent.context_id
    }
  },

  _normalizeConsents () {
    var updatedConsents = {}
    var notUdpatedConsents = {}
    for (const contextId in this.consentManager.preferences) {
      const currentContext = this.consentManager.preferences[contextId]

      for (const consentKey in currentContext.consents) {
        const currentConsent = currentContext.consents[consentKey]

        if (currentConsent._updated) {
          updatedConsents[consentKey] = this._getNormalizedConsent(consentKey, currentConsent)
        } else {
          notUdpatedConsents[consentKey] = this._getNormalizedConsent(consentKey, currentConsent)
        }
      }
    }

    return _.isEmpty(updatedConsents) ? notUdpatedConsents : updatedConsents
  },

  _stringifyPreferences () {
    const clonedPreferences = _.cloneDeep(this.consentManager.preferences)

    for (const contextId in clonedPreferences) {
      const currentContext = clonedPreferences[contextId]
      const consents = currentContext.consents

      for (const purpose in consents) {
        const expiryDate = consents[purpose].expiry_date

        if (!_.isEmpty(expiryDate)) {
          consents[purpose].expiry_date = dayjs(expiryDate).format(this.consentManager.dateFormat)
        }

        consents[purpose].identifier = this.client.track.uuid

        consents[purpose] = _.omit(consents[purpose], ['_updated'])
      }
    }

    return JSON.stringify(clonedPreferences)
  },

  _isValidStatus (status) {
    return status === CONSENT_STATES.GIVEN || status === CONSENT_STATES.REJECTED
  },

  getPreferences () {
    const persistedPreferences = JSON.parse(global.localStorage.getItem(this.consentManager.storageKey)) || null

    if (persistedPreferences) {
      for (const contextId in persistedPreferences) {
        const consents = persistedPreferences[contextId].consents
        for (const purpose in consents) {
          const expiryDate = consents[purpose].expiry_date

          if (!_.isEmpty(expiryDate)) {
            consents[purpose].expiry_date = dayjs(expiryDate, this.consentManager.dateFormat).valueOf()
          }

          consents[purpose].identifier = this.client.track.uuid
        }
      }
    }

    return persistedPreferences
  },

  _savePreferences () {
    if (_.isEmpty(this.consentManager.preferences)) return

    global.localStorage.setItem(
      this.consentManager.storageKey,
      this._stringifyPreferences()
    )
  },

  _getPromise (consent) {
    return new Promise((resolve, reject) => {
      this.addConsentRecord(this.consentManager.consentTable, consent, resolve, reject)
    })
  },

  _resetUpdatedStatus () {
    for (const contextId in this.consentManager.preferences) {
      const consents = this.consentManager.preferences[contextId].consents
      for (const consentKey in consents) {
        const currentConsent = consents[consentKey]
        if (currentConsent._updated) {
          currentConsent._updated = false
        }
      }
    }
  },

  saveContexts (success = _.noop, error = _.noop) {
    // store the consents to cookie first
    this._savePreferences()

    const contextList = Object.keys(this.consentManager.preferences).reduce((list, contextId) => {
      const context = this.consentManager.preferences[contextId]

      list.push({
        context_id: context.context_id,
        brand: context.brand,
        domain_name: context.domain_name,
        collection_type: context.collection_type,
        collection_point_id: context.collection_point_id
      })

      return list
    }, [])

    const promises = contextList.map(context => {
      return new Promise((resolve, reject) => {
        this.addConsentRecord(this.consentManager.contextTable, context, resolve, reject)
      })
    })

    Promise.all(promises).then(success).catch(error)
  },

  saveConsents (success, error) {
    success = success || this.consentManager.successConsentCallback || _.noop
    error = error || this.consentManager.failureConsentCallback || _.noop

    // store the consents to cookie first
    this._savePreferences()

    var updatedConsents = []
    var notUpdatedConsents = []

    // send consents to event-collector
    for (const contextId in this.consentManager.preferences) {
      const consents = this.consentManager.preferences[contextId].consents
      for (const consentKey in consents) {
        const currentConsent = consents[consentKey]

        const normalizedConsent = this._getNormalizedConsent(consentKey, currentConsent)
        if (currentConsent._updated) {
          updatedConsents.push(normalizedConsent)
        } else {
          notUpdatedConsents.push(normalizedConsent)
        }
      }
    }

    var promises
    if (!_.isEmpty(updatedConsents)) {
      promises = updatedConsents.map((consent) => this._getPromise(consent))
    } else {
      promises = notUpdatedConsents.map((consent) => this._getPromise(consent))
    }

    Promise.all(promises).then(() => {
      success(this._normalizeConsents())
    }, (e) => {
      error({ success: false, message: e.message })
    }).finally(() => {
      if (!_.isEmpty(updatedConsents)) {
        this._resetUpdatedStatus()
      }
    })
  },

  addContext (context = {}) {
    if (_.isEmpty(context)) return

    var contextId
    if (_.isString(context.context_id)) {
      contextId = context.context_id
    } else if (_.isFunction(context.context_id)) {
      contextId = context.context_id()
    } else {
      contextId = generateUUID()
    }

    var savedContext
    const currentContext = this.consentManager.preferences[contextId]
    if (currentContext) {
      savedContext = _.assign({}, currentContext, context)
    } else {
      savedContext = _.assign({}, context, {
        context_id: contextId,
        consents: {}
      })
    }

    this.consentManager.preferences[contextId] = savedContext
    return contextId
  },

  addConsents (consents = {}) {
    if (_.isEmpty(consents)) return

    for (const key in consents) {
      const status = this._isValidStatus(consents[key].status) ? consents[key].status : CONSENT_STATES.NOTGIVEN
      var contextId = consents[key].context_id
      var expiryDate = consents[key].expiry_date || ''

      var augmentedConsent

      if (!contextId) {
        contextId = this.defaultContext.context_id

        if (!this.consentManager.preferences[contextId]) {
          this.consentManager.preferences[contextId] = this.defaultContext
        }
      }

      var currentContext = this.consentManager.preferences[contextId]
      var current = currentContext && currentContext.consents[key]

      if (!_.isEmpty(expiryDate) && (_.isString(expiryDate) || _.isNumber(expiryDate) || _.isObject(expiryDate))) {
        const parsedDate = dayjs(expiryDate, this.consentManager.dateFormat)
        expiryDate = parsedDate.isValid() ? parsedDate.valueOf() : ''
      } else {
        expiryDate = ''
      }

      if (!_.isEmpty(current)) {
        augmentedConsent = _.assign(
          {},
          current,
          consents[key]
        )
      } else {
        augmentedConsent = _.assign(
          {},
          consents[key],
          { key: cammelCase(key), status, identifier: this.client.track.uuid, context_id: contextId }
        )
      }

      augmentedConsent.issuer = this.consentManager.issuer
      augmentedConsent.expiry_date = expiryDate

      this.consentManager.preferences[contextId].consents[key] = augmentedConsent
    }
  },

  updateConsent (contextId, consent = {}) {
    if (_.isEmpty(this.consentManager.preferences[contextId]) || _.isEmpty(consent)) return

    const [consentPurpose] = Object.keys(consent)

    const currentConsents = this.consentManager.preferences[contextId].consents
    for (const purpose in currentConsents) {
      if (cammelCase(purpose) === cammelCase(consentPurpose)) {
        currentConsents[consentPurpose] = _.assign(currentConsents[consentPurpose], consent[consentPurpose], { identifier: this.client.track.uuid })
        currentConsents[consentPurpose]['_updated'] = true
        break
      }
    }
  },

  updateContext (contextId, values = {}) {
    if (_.isEmpty(this.consentManager.preferences[contextId])) return

    const brand = values.brand
    const domainName = values.domain_name
    const collectionType = values.collection_type
    const collectionPointId = values.collection_point_id

    if (brand) {
      this.consentManager.preferences[contextId].brand = brand
    }

    if (domainName) {
      this.consentManager.preferences[contextId].domain_name = domainName
    }

    if (collectionType) {
      this.consentManager.preferences[contextId].collection_type = collectionType
    }

    if (collectionPointId) {
      this.consentManager.preferences[contextId].collection_point_id = collectionPointId
    }
  },

  getConsentExpiryDate (contextId, consentPurpose) {
    if (!contextId || !consentPurpose) return

    const consents = this.consentManager.preferences[contextId].consents
    const consent = consents[consentPurpose]

    return (consent && consent.expiry_date) || null
  },

  getConsents () {
    const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences()

    return Object.keys(preferences || {}).reduce((consents, id) => {
      const context = preferences[id]
      const persistedConsents = context.consents

      for (const key in persistedConsents) {
        const normalizedConsent = {
          brand: context.brand || '',
          domain_name: context.domain_name || '',
          collection_type: context.collection_type || '',
          collection_point_id: context.collection_point_id || '',
          context_id: context.context_id,
          status: persistedConsents[key].status,
          datatype: persistedConsents[key].datatype || '',
          description: persistedConsents[key].description || '',
          expiry_date: persistedConsents[key].expiry_date || '',
          identifier: this.client.track.uuid,
          purpose: key
        }

        consents.push(normalizedConsent)
      }

      return consents
    }, [])
  },

  getContexts () {
    const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences()

    return Object.keys(preferences || {}).reduce((contexts, id) => {
      const context = preferences[id]
      const normalizedContext = {
        brand: context.brand || '',
        domain_name: context.domain_name || '',
        collection_type: context.collection_type || '',
        collection_point_id: context.collection_point_id || '',
        context_id: context.context_id
      }

      contexts.push(normalizedContext)
      return contexts
    }, [])
  },

  getExpiredConsents () {
    const today = new Date()
    const consents = this.getConsents()

    return consents.filter(consent => {
      return consent.expiry_date && dayjs(consent.expiry_date).isBefore(dayjs(today))
    })
  }
}
