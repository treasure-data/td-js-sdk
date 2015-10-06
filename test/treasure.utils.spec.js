var expect = require('expect.js')
var objectToBase64 = require('../lib/utils/objectToBase64')
var generateUUID = require('../lib/utils/generateUUID')

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
})
