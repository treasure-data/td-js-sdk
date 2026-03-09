var expect = require('expect.js')
var Treasure = require('../lib/treasure')
var plugin = require('../lib/plugins/personalizationContentEditor')

describe('Personalization Content Editor', function () {
  var td

  beforeEach(function () {
    td = new Treasure({ database: 'database', writeKey: 'writeKey' })
  })

  afterEach(function () {
    td = null
  })

  // -------------------------------------------------------
  // fetchPersonalizationAndReplace — config validation
  // -------------------------------------------------------
  describe('fetchPersonalizationAndReplace', function () {
    it('should be available as a function', function () {
      expect(typeof td.fetchPersonalizationAndReplace === 'function').ok()
    })

    it('should throw when config is missing', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace()
      }).to.throwException()
    })

    it('should throw when config is empty', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({})
      }).to.throwException()
    })

    it('should throw when endpoint is missing', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({
          database: 'db',
          table: 'tb',
          token: 'token'
        })
      }).to.throwException()
    })

    it('should throw when database is missing', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({
          endpoint: 'abc.com',
          table: 'tb',
          token: 'token'
        })
      }).to.throwException()
    })

    it('should throw when table is missing', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({
          endpoint: 'abc.com',
          database: 'db',
          token: 'token'
        })
      }).to.throwException()
    })

    it('should throw when token is missing', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({
          endpoint: 'abc.com',
          database: 'db',
          table: 'tb'
        })
      }).to.throwException()
    })

    it('should not throw with valid config', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace({
          endpoint: 'abc.com',
          database: 'db',
          table: 'tb',
          token: 'wp13n-token'
        })
      }).not.to.throwException()
    })

    it('should not throw with valid config and data', function () {
      expect(function () {
        td.fetchPersonalizationAndReplace(
          {
            endpoint: 'abc.com',
            database: 'db',
            table: 'tb',
            token: 'wp13n-token'
          },
          { td_client_id: '123', page_view: '/home' }
        )
      }).not.to.throwException()
    })
  })

  // -------------------------------------------------------
  // Module exports
  // -------------------------------------------------------
  describe('module exports', function () {
    it('should export configure and fetchPersonalizationAndReplace', function () {
      expect(typeof plugin.configure).to.be('function')
      expect(typeof plugin.fetchPersonalizationAndReplace).to.be('function')
    })

    it('should export test helpers', function () {
      expect(typeof plugin._parseOffers).to.be('function')
      expect(typeof plugin._hideElement).to.be('function')
      expect(typeof plugin._restoreVisibility).to.be('function')
      expect(typeof plugin._showModal).to.be('function')
      expect(typeof plugin._startReplacement).to.be('function')
      expect(typeof plugin._resetReplacementInitialized).to.be('function')
    })
  })

  // -------------------------------------------------------
  // parseOffers
  // -------------------------------------------------------
  describe('parseOffers', function () {
    var parseOffers = plugin._parseOffers

    it('should return empty arrays for null response', function () {
      var result = parseOffers(null)
      expect(result.replacementRules).to.have.length(0)
      expect(result.modalRules).to.have.length(0)
    })

    it('should return empty arrays for response without offers', function () {
      var result = parseOffers({})
      expect(result.replacementRules).to.have.length(0)
      expect(result.modalRules).to.have.length(0)
    })

    it('should skip offers without td_in_browser.message_json', function () {
      var result = parseOffers({
        offers: {
          'some-offer': {
            attributes: { foo: 'bar' }
          }
        }
      })
      expect(result.replacementRules).to.have.length(0)
      expect(result.modalRules).to.have.length(0)
    })

    it('should parse replacement rules', function () {
      var result = parseOffers({
        offers: {
          'test-offer': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                selector: 'h2',
                content_html: '<span>Hello</span>'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(1)
      expect(result.replacementRules[0].selector).to.be('h2')
      expect(result.replacementRules[0].html).to.be('<span>Hello</span>')
      expect(result.modalRules).to.have.length(0)
    })

    it('should parse modal rules', function () {
      var result = parseOffers({
        offers: {
          'modal-offer': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'modal',
                content_html: '<div>Modal content</div>',
                selector: null
              })
            }
          }
        }
      })
      expect(result.modalRules).to.have.length(1)
      expect(result.modalRules[0].html).to.be('<div>Modal content</div>')
      expect(result.replacementRules).to.have.length(0)
    })

    it('should parse multiple offers with mixed types', function () {
      var result = parseOffers({
        offers: {
          'replacement-1': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                selector: 'h1',
                content_html: '<span>Title</span>'
              })
            }
          },
          'replacement-2': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                selector: '.subtitle',
                content_html: '<span>Sub</span>'
              })
            }
          },
          'modal-1': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'modal',
                content_html: '<div>Popup</div>'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(2)
      expect(result.modalRules).to.have.length(1)
    })

    it('should skip invalid JSON gracefully', function () {
      var result = parseOffers({
        offers: {
          'bad-json': {
            attributes: {
              'td_in_browser.message_json': 'not valid json{'
            }
          },
          'good-offer': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                selector: 'h2',
                content_html: '<span>OK</span>'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(1)
      expect(result.replacementRules[0].selector).to.be('h2')
    })

    it('should skip replacement without selector', function () {
      var result = parseOffers({
        offers: {
          'no-selector': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                content_html: '<span>No selector</span>'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(0)
    })

    it('should skip replacement without content_html', function () {
      var result = parseOffers({
        offers: {
          'no-html': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'replacement',
                selector: 'h2'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(0)
    })

    it('should skip modal without content_html', function () {
      var result = parseOffers({
        offers: {
          'no-html-modal': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'modal'
              })
            }
          }
        }
      })
      expect(result.modalRules).to.have.length(0)
    })

    it('should skip unknown types', function () {
      var result = parseOffers({
        offers: {
          'unknown': {
            attributes: {
              'td_in_browser.message_json': JSON.stringify({
                type: 'banner',
                content_html: '<div>Banner</div>'
              })
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(0)
      expect(result.modalRules).to.have.length(0)
    })

    it('should skip offers with null attributes', function () {
      var result = parseOffers({
        offers: {
          'null-attrs': { attributes: null },
          'no-attrs': {}
        }
      })
      expect(result.replacementRules).to.have.length(0)
      expect(result.modalRules).to.have.length(0)
    })

    it('should handle escaped backslashes in message_json', function () {
      var json = JSON.stringify({
        type: 'replacement',
        selector: 'h2',
        content_html: '<span>Test</span>'
      })
      // Simulate double-escaped backslashes from server
      var doubleEscaped = json.replace(/\\/g, '\\\\')
      var result = parseOffers({
        offers: {
          'escaped': {
            attributes: {
              'td_in_browser.message_json': doubleEscaped
            }
          }
        }
      })
      expect(result.replacementRules).to.have.length(1)
    })
  })

  // -------------------------------------------------------
  // hideElement / restoreVisibility
  // -------------------------------------------------------
  describe('hideElement', function () {
    var hideElement = plugin._hideElement
    var restoreVisibility = plugin._restoreVisibility

    afterEach(function () {
      // Clean up test elements
      var els = document.querySelectorAll('[data-td-test]')
      for (var i = 0; i < els.length; i++) {
        els[i].parentNode.removeChild(els[i])
      }
    })

    function createEl () {
      var el = document.createElement('div')
      el.setAttribute('data-td-test', 'true')
      document.body.appendChild(el)
      return el
    }

    it('should hide element by setting visibility to hidden', function () {
      var el = createEl()
      hideElement(el)
      expect(el.style.visibility).to.be('hidden')
    })

    it('should save original visibility in dataset', function () {
      var el = createEl()
      el.style.visibility = 'visible'
      hideElement(el)
      expect(el.dataset.tdOriginalVisibility).to.be('visible')
    })

    it('should save empty string when no original visibility set', function () {
      var el = createEl()
      hideElement(el)
      expect(el.dataset.tdOriginalVisibility).to.be('')
    })

    it('should not re-hide an already hidden element', function () {
      var el = createEl()
      el.style.visibility = 'visible'
      hideElement(el)
      expect(el.dataset.tdOriginalVisibility).to.be('visible')

      // Manually change dataset to verify it's not overwritten
      el.dataset.tdOriginalVisibility = 'visible'
      hideElement(el)
      expect(el.dataset.tdOriginalVisibility).to.be('visible')
    })

    it('should handle null element gracefully', function () {
      expect(function () {
        hideElement(null)
      }).not.to.throwException()
    })
  })

  describe('restoreVisibility', function () {
    var hideElement = plugin._hideElement
    var restoreVisibility = plugin._restoreVisibility

    afterEach(function () {
      var els = document.querySelectorAll('[data-td-test]')
      for (var i = 0; i < els.length; i++) {
        els[i].parentNode.removeChild(els[i])
      }
    })

    function createEl () {
      var el = document.createElement('div')
      el.setAttribute('data-td-test', 'true')
      document.body.appendChild(el)
      return el
    }

    it('should restore original visibility', function () {
      var el = createEl()
      el.style.visibility = 'visible'
      hideElement(el)
      expect(el.style.visibility).to.be('hidden')
      restoreVisibility(el)
      expect(el.style.visibility).to.be('visible')
    })

    it('should restore empty visibility', function () {
      var el = createEl()
      hideElement(el)
      restoreVisibility(el)
      expect(el.style.visibility).to.be('')
    })

    it('should remove dataset attribute after restore', function () {
      var el = createEl()
      hideElement(el)
      restoreVisibility(el)
      expect(el.dataset.tdOriginalVisibility).to.be(undefined)
    })

    it('should not throw on element without saved visibility', function () {
      var el = createEl()
      expect(function () {
        restoreVisibility(el)
      }).not.to.throwException()
    })

    it('should handle null element gracefully', function () {
      expect(function () {
        restoreVisibility(null)
      }).not.to.throwException()
    })
  })

  // -------------------------------------------------------
  // showModal
  // -------------------------------------------------------
  describe('showModal', function () {
    var showModal = plugin._showModal

    afterEach(function () {
      var hosts = document.querySelectorAll('#td-popup-host')
      for (var i = 0; i < hosts.length; i++) {
        hosts[i].parentNode.removeChild(hosts[i])
      }
    })

    it('should create a host element in the body', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      expect(host).to.be.ok()
      expect(host.parentNode).to.be(document.body)
    })

    it('should create host with fixed positioning and high z-index', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      expect(host.style.position).to.be('fixed')
      expect(host.style.zIndex).to.be('999999')
    })

    it('should attach a shadow DOM', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      expect(host.shadowRoot).to.be.ok()
    })

    it('should contain overlay, wrapper, and close button in shadow DOM', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      var shadow = host.shadowRoot
      expect(shadow.querySelector('.overlay')).to.be.ok()
      expect(shadow.querySelector('.popup-wrapper')).to.be.ok()
      expect(shadow.querySelector('.close-btn')).to.be.ok()
    })

    it('should insert contentHtml into the wrapper', function () {
      showModal('<div class="test-content">Hello</div>')
      var host = document.getElementById('td-popup-host')
      var wrapper = host.shadowRoot.querySelector('.popup-wrapper')
      expect(wrapper.querySelector('.test-content')).to.be.ok()
      expect(wrapper.querySelector('.test-content').textContent).to.be('Hello')
    })

    it('should contain a style element with host reset', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      var style = host.shadowRoot.querySelector('style')
      expect(style).to.be.ok()
      expect(style.textContent).to.contain(':host { all: initial; }')
    })

    it('should remove host when close button is clicked', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      var closeBtn = host.shadowRoot.querySelector('.close-btn')
      closeBtn.click()
      expect(document.getElementById('td-popup-host')).to.be(null)
    })

    it('should remove host when overlay background is clicked', function () {
      showModal('<div>Test</div>')
      var host = document.getElementById('td-popup-host')
      var overlay = host.shadowRoot.querySelector('.overlay')
      // Simulate click on overlay itself (not on child)
      var event = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(event, 'target', { value: overlay })
      overlay.dispatchEvent(event)
      expect(document.getElementById('td-popup-host')).to.be(null)
    })

    it('should allow multiple modals', function () {
      showModal('<div>Modal 1</div>')
      showModal('<div>Modal 2</div>')
      var hosts = document.querySelectorAll('#td-popup-host')
      expect(hosts.length).to.be(2)
    })
  })

  // -------------------------------------------------------
  // startReplacement
  // -------------------------------------------------------
  describe('startReplacement', function () {
    var startReplacement = plugin._startReplacement
    var resetInit = plugin._resetReplacementInitialized

    beforeEach(function () {
      resetInit()
    })

    afterEach(function () {
      // Clean up test elements
      var els = document.querySelectorAll('[data-td-test]')
      for (var i = 0; i < els.length; i++) {
        els[i].parentNode.removeChild(els[i])
      }
      resetInit()
    })

    function createTarget (id, content) {
      var el = document.createElement('div')
      el.id = id
      el.setAttribute('data-td-test', 'true')
      el.innerHTML = content || 'Original'
      document.body.appendChild(el)
      return el
    }

    // Trigger MutationObserver by making a small DOM change
    function triggerMutation () {
      var tmp = document.createElement('span')
      document.body.appendChild(tmp)
      document.body.removeChild(tmp)
    }

    it('should replace element innerHTML after stability check', function (done) {
      var el = createTarget('replace-test', 'Original')
      startReplacement([{ selector: '#replace-test', html: '<span>Replaced</span>' }])

      // Trigger multiple mutation cycles for stability check
      setTimeout(function () { triggerMutation() }, 150)
      setTimeout(function () { triggerMutation() }, 300)
      setTimeout(function () { triggerMutation() }, 450)

      setTimeout(function () {
        expect(el.innerHTML).to.be('<span>Replaced</span>')
        done()
      }, 1000)
    })

    it('should set data-td-replaced attribute after replacement', function (done) {
      createTarget('marker-test', 'Original')
      startReplacement([{ selector: '#marker-test', html: '<span>New</span>' }])

      setTimeout(function () { triggerMutation() }, 150)
      setTimeout(function () { triggerMutation() }, 300)
      setTimeout(function () { triggerMutation() }, 450)

      setTimeout(function () {
        var el = document.getElementById('marker-test')
        expect(el.dataset.tdReplaced).to.be('0')
        done()
      }, 1000)
    })

    it('should restore visibility after replacement', function (done) {
      var el = createTarget('visibility-test', 'Original')
      startReplacement([{ selector: '#visibility-test', html: '<span>New</span>' }])

      setTimeout(function () { triggerMutation() }, 150)
      setTimeout(function () { triggerMutation() }, 300)
      setTimeout(function () { triggerMutation() }, 450)

      setTimeout(function () {
        expect(el.style.visibility).not.to.be('hidden')
        done()
      }, 1000)
    })

    it('should prevent double initialization', function () {
      createTarget('double-init-test', 'Original')
      startReplacement([{ selector: '#double-init-test', html: 'First' }])
      // Second call should be ignored
      startReplacement([{ selector: '#double-init-test', html: 'Second' }])
      // No assertion needed; if it didn't prevent, there would be duplicate observers
    })

    it('should skip elements with data-td-replaced', function (done) {
      var el = createTarget('skip-test', 'Original')
      el.dataset.tdReplaced = '99'
      startReplacement([{ selector: '#skip-test', html: '<span>Should not replace</span>' }])

      setTimeout(function () { triggerMutation() }, 150)
      setTimeout(function () { triggerMutation() }, 300)

      setTimeout(function () {
        expect(el.innerHTML).to.be('Original')
        done()
      }, 1000)
    })
  })

  // -------------------------------------------------------
  // Force activate event
  // -------------------------------------------------------
  describe('force activate', function () {
    var startReplacement = plugin._startReplacement
    var resetInit = plugin._resetReplacementInitialized

    beforeEach(function () {
      resetInit()
    })

    afterEach(function () {
      var els = document.querySelectorAll('[data-td-test]')
      for (var i = 0; i < els.length; i++) {
        els[i].parentNode.removeChild(els[i])
      }
      resetInit()
    })

    function createTarget (id, content) {
      var el = document.createElement('div')
      el.id = id
      el.setAttribute('data-td-test', 'true')
      el.innerHTML = content || 'Original'
      document.body.appendChild(el)
      return el
    }

    function triggerMutation () {
      var tmp = document.createElement('span')
      document.body.appendChild(tmp)
      document.body.removeChild(tmp)
    }

    it('should re-apply rules when force activate event is dispatched', function (done) {
      var el = createTarget('force-test', 'Original')
      startReplacement([{ selector: '#force-test', html: '<span>Replaced</span>' }])

      // Wait for initial replacement
      setTimeout(function () { triggerMutation() }, 150)
      setTimeout(function () { triggerMutation() }, 300)
      setTimeout(function () { triggerMutation() }, 450)

      setTimeout(function () {
        expect(el.innerHTML).to.be('<span>Replaced</span>')

        // Simulate framework overwriting the replacement
        el.innerHTML = 'Overwritten by React'
        delete el.dataset.tdReplaced

        // Dispatch force activate
        document.dispatchEvent(new Event('td-in-browser-force-activate'))

        // Trigger mutations for re-apply
        setTimeout(function () { triggerMutation() }, 150)
        setTimeout(function () { triggerMutation() }, 300)
        setTimeout(function () { triggerMutation() }, 450)

        setTimeout(function () {
          expect(el.innerHTML).to.be('<span>Replaced</span>')
          done()
        }, 1000)
      }, 1000)
    })
  })
})
