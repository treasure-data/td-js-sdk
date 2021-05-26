var _ = require('../utils/lodash')
var dayjs = require('dayjs')
var global = require('global')
var generateUUID = require('../utils/generateUUID')
var misc = require('../utils/misc')
var promisePolyfill = require('es6-promise')

var camelCase = misc.camelCase
var isLocalStorageAccessible = misc.isLocalStorageAccessible

promisePolyfill.polyfill()

const STORAGE_KEY = 'td_consent_preferences'
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

module.exports = {
  // setup consent manager
  configure (options = {}) {
    const consentManager = options.consentManager || {}
    const hostname = document.location.hostname

    const {
      storageKey = STORAGE_KEY,
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
      expiry_date: consent.expiry_date || null,
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
    if (!isLocalStorageAccessible()) return null

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
    if (!isLocalStorageAccessible() || _.isEmpty(this.consentManager.preferences)) return

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

  /**
   * @function saveContexts([success],[error])
   *  Save the contexts to the local storage and to the Treasure Data platform
   *
   * @param {function} [success] - Callback for when saving the contexts successfully
   * @param {function} [error] - Callback for when saving the contexts unsuccessfully
   *
   * @example
   * function success () {
   *   // yay()
   * }
   *
   * function error (err) {
   *   // err: { success: false, message: 'Timeout' }
   * }
   *
   * sdk.saveContexts(success, error)
   */
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

  /**
 * @function saveConsents([success],[error])
 *  Save the consents to the local storage and to the Treasure Data platform.
 *  If you don’t specify the callbacks, the callbacks that are configured in the Configurations section above will be called.
 *
 * @param {function} [success] - Callback for when saving the consents successfully
 * @param {function} [error] - Callback for when saving the consents unsuccessfully
 *
 * @example
 * function success () {
 *   // yay()
 * }
 *
 * function error (err) {
 *
 *   // err: { success: false, message: 'Timeout' }
 *
 * }
 *
 * sdk.saveConsents(success, error)
 *
 */
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

  /**
 * @function addContext(context)
 * Adding context for consents, the context will be included when we send data to TD platform (event-collector). Users can specify their own context id otherwise a new context id will be generated.
 * Returns {uuid} context id
 *
 * @param context
 * @property {string} context.brand - brand name
 * @property {string} context.domain_name - domain name
 * @property {string} context.collection_type - consent collection type
 * @property {string} context.collection_point_id - consent collection point id
 * @property {string} [context.context_id] - Context Id
 *
 * @example
 * sdk.addContext({
 *   brand: 'A Brand',
 *   domain_name: 'abrand.com',
 *   collection_type: 'shopping_cart',
 *   collection_point_id: 'shopping_trnx_id'
 *   context_id: 'uuid'
 * })
 *
 */
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

  /**
 * @function addConsents(consents)
 *  Adding consents. For the consents that don’t have context ID, they will be added to a default context
 *
 * @param    {object}             consents
 * @property {object}             consents.consent                    - Specific consent
 * @property {string}             consents.consent.key                - purpose of consent
 * @property {object}             consents.consent.values             - consent information
 * @property {string}             consents.consent.values.description - Consent’s description
 * @property {string}             consents.consent.values.datatype    - data type
 * @property {string}             consents.consent.values.status      - Consent’s status (given | refused | notgiven). Default: `notgiven`
 * @property {string|Number|Date} consents.consent.values.expiry_date - expiry date
 * @property {string}             consents.consent.values.context_id  - Context Id
 *
 * @example
 * sdk.addConsents({
 *   'marketing': { // <--- purpose
 *     description: 'description of consent',
 *     datatype: 'Attibutes',
 *     status: 'given|refused',
 *     expiry_date: 'YYYY-MM-DD',
 *     context_id: 'context_id'
 *   },
 *   'storing': { // <--- purpose
 *     description: 'description',
 *     datatype: 'datatype',
 *     status: 'given|refused',
 *     expiry_date: 'YYYY-MM-DD',
 *     context_id: 'context_id'
 *   },
 *   'recommendations': { // <--- purpose
 *     description: 'description',
 *     datatype: 'datatype',
 *     status: 'given|refused',
 *     expiry_date: 'YYYY-MM-DD',
 *     context_id: 'context_id'
 *   }
 * )
 */
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

  /**
 * @function updateConsent(contextId,consentObject)
 * Update a specific consent. When you update a consent, only the updated consent is sent to the `successConsentCallback` after calling `saveConsents`.
 *
 * @param {string} contextId     - Context Id
 * @param {object} consentObject - Consent that you want to update
 *
 * @example
 * sdk.updateConsent('xxxxxx-context-id', {
 *   'recommendations': {
 *     status: 'refused'
 *   }
 * })
 */
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

  /**
 * @function updateContext(contextId,values)
 *  Update a specific context
 *
 * @param {string} contextId - Context Id
 * @param {object} values    - Values of context that you want to update
 *
 * @example
 * sdk.updateContext('xxxxxx-context-id', {
 *   brand: 'Other brand',
 *   domain_name: 'otherdomain.com'
 * })
 *
 */
  updateContext (contextId, values = {}) {
    const context = this.consentManager.preferences[contextId]

    if (_.isEmpty(context) || _.isEmpty(values)) return

    var contextInfo = _.omit(context, ['consents'])
    contextInfo = _.assign({}, contextInfo, values)

    this.consentManager.preferences[contextId] = _.assign({}, context, contextInfo)
  },

  /**
 * @function getConsentExpiryDate(contextId,consentPurpose)
 * @description Get expiry date for a specific consent
 *
 * @param {string} contextId       - Context Id
 * @param {string} consentPurpose - The consent’s purpose
 *
 * @example
 * sdk.getConsentExpiryDate('context_id', 'analytics')
 *
 */
  getConsentExpiryDate (contextId, consentPurpose) {
    if (!contextId || !consentPurpose) return

    const consents = this.consentManager.preferences[contextId].consents
    const consent = consents[consentPurpose]

    return (consent && consent.expiry_date) || null
  },

  /**
 * @function getConsents()
 * @description Return list of consents
 */
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

  /**
 * @function getContexts()
 * Return list of contexts
 *
 */
  getContexts () {
    const preferences = !_.isEmpty(this.consentManager.preferences) ? this.consentManager.preferences : this.getPreferences()

    return Object.keys(preferences || {}).reduce((contexts, id) => {
      const context = preferences[id]
      const normalizedContext = _.omit(context, ['consents'])
      contexts.push(normalizedContext)
      return contexts
    }, [])
  },

  /**
 * @function getExpiredConsents()
 * Returns expired consents
 */
  getExpiredConsents () {
    const consents = this.getConsents()

    return consents.filter(consent => {
      return consent.status === CONSENT_STATES.EXPIRED || this._isExpired(consent)
    })
  }
}
