import _ from '../utils/lodash'
import dayjs from 'dayjs'
import global from 'global'
import generateUUID from '../utils/generateUUID'
import { camelCase } from '../utils/misc'

const COOKIE_NAME = 'td_consent_preferences'
const DEFAULT_CONSENT_TABLE = 'td_cm_consent'
const DEFAULT_CONTEXT_TABLE = 'td_cm_context'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_ISSUER = 'treasuredata'
const CONSENT_STATES = {
  GIVEN: 'given',
  REFUSED: 'refused',
  NOTGIVEN: 'notgiven',
  EXPIRED: 'expired'
}

// 'finally' polyfill for Edge 15
/* eslint-disable */
Promise.prototype.finally = Promise.prototype.finally || {
  finally (fn) {
    const onFinally = callback => Promise.resolve(fn()).then(callback)
    return this.then(
      result => onFinally(() => result),
      reason => onFinally(() => Promise.reject(reason))
    )
  }
}.finally
/* eslint-enable */

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
      container,
      states: { ...CONSENT_STATES }
    }

    this.consentManager.preferences = this.getPreferences() || {}

    this._updateExpiredConsents()
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
    if (!status || !_.isString(status)) return false

    status = status.toLowerCase()

    return status === CONSENT_STATES.GIVEN || status === CONSENT_STATES.REFUSED || status === CONSENT_STATES.NOTGIVEN || status === CONSENT_STATES.EXPIRED
  },

  _isExpired (consent) {
    const today = new Date()
    return consent.status === CONSENT_STATES.GIVEN && consent.expiry_date && dayjs(consent.expiry_date).isBefore(dayjs(today))
  },

  _updateExpiredConsents () {
    var shouldSaveConsents = false
    if (!_.isEmpty(this.consentManager.preferences)) {
      for (const contextId in this.consentManager.preferences) {
        const consents = this.consentManager.preferences[contextId].consents || {}

        for (const purpose in consents) {
          const consent = consents[purpose]

          if (this._isExpired(consent)) {
            consent.status = CONSENT_STATES.EXPIRED
            consent._updated = true
            shouldSaveConsents = true
          }
        }
      }
    }

    shouldSaveConsents && this.saveConsents(_.noop, _.noop)
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

      const serializedContext = _.omit(context, ['consents'])
      list.push(serializedContext)

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
          { key: camelCase(key), status, identifier: this.client.track.uuid, context_id: contextId }
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
      if (camelCase(purpose) === camelCase(consentPurpose)) {
        var status = consent[consentPurpose].status || ''
        var expiryDate = consent[consentPurpose].expiry_date || ''

        if (!this._isValidStatus(status)) {
          status = currentConsents[consentPurpose].status
        }

        if (!_.isEmpty(expiryDate) && (_.isString(expiryDate) || _.isNumber(expiryDate) || _.isObject(expiryDate))) {
          const parsedDate = dayjs(expiryDate, this.consentManager.dateFormat)
          expiryDate = parsedDate.isValid() ? parsedDate.valueOf() : currentConsents[consentPurpose].expiry_date
        } else {
          expiryDate = currentConsents[consentPurpose].expiry_date
        }

        const filteredConsent = _.omit(currentConsents[consentPurpose], ['expiry_date', 'status'])
        currentConsents[consentPurpose] = _.assign(
          filteredConsent,
          _.omit(consent[consentPurpose], ['expiry_date', 'status']),
          { identifier: this.client.track.uuid, status, expiry_date: expiryDate }
        )
        currentConsents[consentPurpose]['_updated'] = true
        break
      }
    }
  },

  updateContext (contextId, values = {}) {
    const context = this.consentManager.preferences[contextId]

    if (_.isEmpty(context) || _.isEmpty(values)) return

    var contextInfo = _.omit(context, ['consents'])
    contextInfo = _.assign({}, contextInfo, values)

    this.consentManager.preferences[contextId] = _.assign({}, context, contextInfo)
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

      const contextInfo = _.omit(context, ['consents'])

      for (const key in persistedConsents) {
        const normalizedConsent = _.assign({}, contextInfo, {
          status: persistedConsents[key].status,
          datatype: persistedConsents[key].datatype || '',
          description: persistedConsents[key].description || '',
          expiry_date: persistedConsents[key].expiry_date || '',
          identifier: this.client.track.uuid,
          purpose: key
        })

        consents.push(normalizedConsent)
      }

      return consents
    }, [])
  },

  getContexts () {
    const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences()

    return Object.keys(preferences || {}).reduce((contexts, id) => {
      const context = preferences[id]
      const normalizedContext = _.omit(context, ['consents'])
      contexts.push(normalizedContext)
      return contexts
    }, [])
  },

  getExpiredConsents () {
    const consents = this.getConsents()

    return consents.filter(consent => {
      return consent.status === CONSENT_STATES.EXPIRED || this._isExpired(consent)
    })
  }
}
