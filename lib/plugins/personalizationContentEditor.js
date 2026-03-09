/**
 * personalizationContentEditor
 *
 * Plugin that interprets Personalization API responses and performs two types of DOM operations.
 *
 * [Flow]
 *   fetchPersonalizationAndReplace()
 *     -> POST /public/{database}/{table}
 *     -> parseOffers(response)
 *        -> Parse td_in_browser.message_json from each offer
 *        -> type=replacement -> startReplacement() for polling-based DOM replacement
 *        -> type=modal       -> showModal() for immediate display
 *
 * [Replacement]
 *   - MutationObserver (primary) + slow polling (fallback) to detect DOM changes
 *   - Stability check: replace innerHTML after element matches STABLE_COUNT consecutive times
 *   - Flicker prevention: hide element with visibility:hidden on discovery, restore after replacement
 *   - Marking: data-td-replaced attribute to prevent duplicate application
 *   - SPA support: reset state on URL change detection
 *   - Rate limiting: stop if applyRules exceeds RATE_LIMIT_MAX within RATE_LIMIT_WINDOW
 *   - Force re-activate: td-in-browser-force-activate event for React hydration recovery
 *
 * [Modal]
 *   - Isolated from host page styles via Shadow DOM
 *   - SDK provides overlay, close button, and wrapper
 *   - contentHtml (Beefree output) inserted as-is
 */
const { invariant } = require('../utils/misc')
const _ = require('../utils/lodash')
const api = require('../utils/xhr')
const win = require('global/window')

const FAST = 100
const SLOW = 1000
const TIMEOUT = 30000
const STABLE_COUNT = 2
const RATE_LIMIT_WINDOW = 5000
const RATE_LIMIT_MAX = 20
const FORCE_ACTIVATE_EVENT = 'td-in-browser-force-activate'

function configure () {
  return this
}

function hideElement (el) {
  if (el && el.style.visibility !== 'hidden') {
    el.dataset.tdOriginalVisibility = el.style.visibility
    el.style.visibility = 'hidden'
  }
}

function restoreVisibility (el) {
  if (el && el.dataset.tdOriginalVisibility !== undefined) {
    el.style.visibility = el.dataset.tdOriginalVisibility
    delete el.dataset.tdOriginalVisibility
  }
}

let replacementInitialized = false

/**
 * Start DOM replacement for a set of rules.
 * Each rule must have { selector, html }.
 * Uses MutationObserver as primary trigger with slow polling fallback.
 * Includes stability checks, flicker prevention, rate limiting,
 * and SPA navigation detection.
 */
function startReplacement (rules) {
  if (replacementInitialized) return
  replacementInitialized = true
  const candidates = {}
  const applied = {}
  const backups = {}
  let lastUrl = null
  let startTime = Date.now()
  let debounceTimer = null
  let timedOut = false
  let rateLimitStopped = false
  const applyTimestamps = []

  const restoreAllHidden = () => {
    rules.forEach((rule, i) => {
      if (candidates[i] && candidates[i].el) {
        restoreVisibility(candidates[i].el)
      }
    })
  }

  const resetState = () => {
    restoreAllHidden()
    Object.keys(applied).forEach((k) => { delete applied[k] })
    Object.keys(candidates).forEach((k) => { delete candidates[k] })
    Object.keys(backups).forEach((k) => { delete backups[k] })
    startTime = Date.now()
    timedOut = false
    rateLimitStopped = false
    applyTimestamps.length = 0
  }

  const applyRules = () => {
    // Rate limit: stop if too many apply cycles in a short window
    if (rateLimitStopped) return
    const now = Date.now()
    applyTimestamps.push(now)
    while (applyTimestamps.length > 0 && applyTimestamps[0] < now - RATE_LIMIT_WINDOW) {
      applyTimestamps.shift()
    }
    if (applyTimestamps.length > RATE_LIMIT_MAX) {
      restoreAllHidden()
      rateLimitStopped = true
      return
    }

    const url = win.location.href.split('#')[0]

    // URL changed (SPA navigation) -> reset
    if (lastUrl !== null && lastUrl !== url) {
      resetState()
    }
    lastUrl = url

    let pending = 0

    rules.forEach((rule, i) => {
      // Already applied -> check if selector still points to same element
      if (applied[i]) {
        const current = win.document.querySelector(rule.selector)
        if (current === applied[i]) return // stable, skip
        // Selector now returns different element (DOM structure changed)
        if (backups[i] && win.document.contains(backups[i].el)) {
          backups[i].el.innerHTML = backups[i].originalHtml
          restoreVisibility(backups[i].el)
          delete backups[i].el.dataset.tdReplaced
        }
        applied[i] = null
        backups[i] = null
        candidates[i] = null
      }

      const el = win.document.querySelector(rule.selector)
      if (!el) {
        candidates[i] = null
        pending++
        return
      }

      // Skip if already replaced by another rule or previous run
      if (el.dataset.tdReplaced) return

      // Hide element immediately to prevent flicker
      hideElement(el)

      // Stability check: same element for STABLE_COUNT consecutive checks
      if (candidates[i] && candidates[i].el === el) {
        candidates[i].count++
      } else {
        // Element changed during wait -> restore previous one
        if (candidates[i] && candidates[i].el) {
          restoreVisibility(candidates[i].el)
        }
        candidates[i] = { el, count: 1 }
      }

      if (candidates[i].count >= STABLE_COUNT) {
        backups[i] = { el, originalHtml: el.innerHTML }
        el.innerHTML = rule.html
        el.dataset.tdReplaced = String(i)
        restoreVisibility(el)
        applied[i] = el
        candidates[i] = null
      } else {
        pending++
      }
    })

    // Timeout -> restore hidden elements that haven't been replaced
    if (!timedOut && Date.now() - startTime > TIMEOUT) {
      restoreAllHidden()
      timedOut = true
    }
  }

  // Debounced version for MutationObserver (avoid excessive processing)
  const scheduleApply = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(applyRules, FAST)
  }

  // Primary: MutationObserver for DOM changes
  const Observer = win.MutationObserver || win.WebKitMutationObserver
  if (Observer) {
    const observer = new Observer(scheduleApply)
    observer.observe(win.document.documentElement, {
      childList: true,
      subtree: true
    })
  }

  // Fallback: slow polling for cases MutationObserver might miss
  // (e.g., pushState without DOM changes, iframes)
  setInterval(applyRules, SLOW)

  // Force re-activate (e.g., after React hydration)
  // Usage: document.dispatchEvent(new Event('td-in-browser-force-activate'))
  win.document.addEventListener(FORCE_ACTIVATE_EVENT, () => {
    resetState()
    applyRules()
  })

  // Initial run
  applyRules()
}

/**
 * Show a modal using Shadow DOM to isolate styles from the host page.
 * The SDK provides the overlay, close button, and wrapper.
 * contentHtml is the Beefree-generated HTML (including its own <style> tags).
 */
function showModal (contentHtml) {
  const host = win.document.createElement('div')
  host.id = 'td-popup-host'
  host.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;'
  win.document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  // --- Styles ---
  const style = win.document.createElement('style')
  style.textContent = [
    ':host { all: initial; }',
    '.overlay {',
    '  position: fixed;',
    '  top: 0; left: 0;',
    '  width: 100%; height: 100%;',
    '  background: rgba(0,0,0,0.5);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '}',
    '.popup-wrapper {',
    '  position: relative;',
    '}',
    '.close-btn {',
    '  position: absolute;',
    '  top: -12px; right: -12px;',
    '  width: 28px; height: 28px;',
    '  border-radius: 50%;',
    '  border: none;',
    '  background: #fff;',
    '  color: #333;',
    '  font-size: 16px;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  box-shadow: 0 2px 4px rgba(0,0,0,0.3);',
    '  z-index: 1;',
    '}'
  ].join('\n')
  shadow.appendChild(style)

  // --- DOM structure ---
  const overlay = win.document.createElement('div')
  overlay.className = 'overlay'

  const wrapper = win.document.createElement('div')
  wrapper.className = 'popup-wrapper'

  const closeBtn = win.document.createElement('button')
  closeBtn.className = 'close-btn'
  closeBtn.innerHTML = '&times;'

  wrapper.appendChild(closeBtn)
  wrapper.insertAdjacentHTML('beforeend', contentHtml)
  overlay.appendChild(wrapper)
  shadow.appendChild(overlay)

  // --- Events ---
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) host.remove()
  })
  closeBtn.addEventListener('click', function () {
    host.remove()
  })

}

/**
 * Parse API response offers into replacement and modal rules.
 */
function parseOffers (response) {
  const replacementRules = []
  const modalRules = []
  const offers = response && response.offers
  if (offers) {
    Object.keys(offers).forEach((key) => {
      const { attributes } = offers[key] || {}
      if (!attributes || !attributes['td_in_browser.message_json']) return
      try {
        const raw = attributes['td_in_browser.message_json'].replace(/\\\\/g, '\\')
        const parsed = JSON.parse(raw)
        if (parsed.type === 'replacement' && parsed.selector && parsed.content_html) {
          replacementRules.push({ selector: parsed.selector, html: parsed.content_html })
        } else if (parsed.type === 'modal' && parsed.content_html) {
          modalRules.push({ html: parsed.content_html })
        }
      } catch (e) {
        // skip parse failures
      }
    })
  }
  return { replacementRules, modalRules }
}

/**
 * Fetch personalization and apply DOM changes based on message_json.
 */
function fetchPersonalizationAndReplace (config, data, successCallback, errorCallback) {
  invariant(_.isObject(config), `config must be an object, received "${config}"`)
  invariant(config.endpoint, 'endpoint is invalid')
  invariant(config.database, 'database is invalid')
  invariant(config.table, 'table is invalid')
  invariant(config.token, 'token is invalid')

  successCallback = successCallback || _.noop
  errorCallback = errorCallback || _.noop

  const url = `https://${config.endpoint}/public/${config.database}/${config.table}`
  const payload = data || {}

  api
    .post(url, payload, {
      headers: {
        'Content-Type': 'application/vnd.treasuredata.v1+json',
        'Authorization': `TD1 ${this.client.writeKey}`,
        'WP13n-Token': config.token
      }
    })
    .then((response) => {
      const { replacementRules, modalRules } = parseOffers(response)

      if (replacementRules.length > 0) {
        startReplacement(replacementRules)
      }

      modalRules.forEach(function (rule) {
        showModal(rule.html)
      })

      successCallback({ replacementRules, modalRules })
    })
    .catch(errorCallback)
}

module.exports = {
  configure,
  fetchPersonalizationAndReplace,
  // Exported for testing
  _parseOffers: parseOffers,
  _hideElement: hideElement,
  _restoreVisibility: restoreVisibility,
  _showModal: showModal,
  _startReplacement: startReplacement,
  _resetReplacementInitialized: function () { replacementInitialized = false }
}
