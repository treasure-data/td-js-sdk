var expect = require('expect.js')
var simple = require('simple-mock')
var objectToBase64 = require('../lib/utils/objectToBase64')
var generateUUID = require('../lib/utils/generateUUID')
var fetchWithTimeout = require('../lib/utils/misc').fetchWithTimeout
var isValidDomain = require('../lib/utils/misc').isValidDomain
var _ = require('lodash-compat')

describe('Treasure Utils', function () {
  describe('objectToBase64', function () {
    it('converts an object to a base64 string', function () {
      var testObject = { text: 'text' }
      var expectedResult = 'eyJ0ZXh0IjoidGV4dCJ9'
      expect(objectToBase64(testObject)).to.equal(expectedResult)
    })

    it('handles unicode strings', function () {
      var testObject = { ramen: 'ラーメン' }
      var expectedResult = 'eyJyYW1lbiI6IuODqeODvOODoeODsyJ9'
      expect(objectToBase64(testObject)).to.equal(expectedResult)
    })
  })

  describe('generateUUID', function () {
    it('generates a valid UUID', function () {
      var uuidRegex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i
      expect(uuidRegex.test(generateUUID())).to.equal(true)
    })
  })

  describe('misc', function () {
    describe('fetchWithTimeout', function () {
      it('must abort after a while', function (done) {
        // Disable testing this feature for iOS 11 due to flakyness
        if (_.includes(_.get(navigator, 'userAgent'), 'iPhone OS 11_0')) { done(); return }

        if (window.AbortController) {
          var abortSpy = simple.mock(window.AbortController.prototype, 'abort')
          fetchWithTimeout('https://apple.com', 1)
            .then(function () {
              done(new Error('but instead succeeded'))
            })['catch'](function () {
              if (abortSpy.callCount === 1) {
                done()
              } else {
                done(new Error('expect to call AbortController.abort once but instead called ' + abortSpy.callCount + ' times'))
              }
            })
        } else if (window.fetch) {
          fetchWithTimeout('https://apple.com', 1)
            .then(function () {
              done(new Error('but instead succeeded'))
            })['catch'](function (error) {
              if (error.message === 'Request Timeout') {
                done()
              } else {
                done(new Error('but failed with wrong error with message ' + error.message))
              }
            })
        } else {
          done()
        }
      })
    })

    describe('isValidDomain', function () {
      it('domain should be invalid', function () {
        var flag = isValidDomain('com')
        expect(flag).to.equal(false)

        flag = isValidDomain('.com')
        expect(flag).to.equal(false)
      })

      it('domain should be valid', function () {
        var flag = isValidDomain('abc.com')
        expect(flag).to.equal(true)

        flag = isValidDomain('thisisaverylongdomainthatisvalid.com')
        expect(flag).to.equal(true)

        flag = isValidDomain('thisisalongsubdomain.abc.com')
        expect(flag).to.equal(true)

        flag = isValidDomain('thisisalongsubdomain.abc.com.vn')
        expect(flag).to.equal(true)

        flag = isValidDomain('thisisalongsubdomain.abc.co.uk')
        expect(flag).to.equal(true)

        flag = isValidDomain('treasuredata.somethingelse')
        expect(flag).to.equal(true)
      })
    })
  })
})
