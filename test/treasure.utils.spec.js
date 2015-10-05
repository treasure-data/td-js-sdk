var expect = require('expect.js')
var objectToBase64 = require('../lib/utils/objectToBase64')
var generateUUID = require('../lib/utils/generateUUID')

describe('Treasure Utils', function () {
  describe('objectToBase64', function () {
    it('converts an object to a base64 string', function () {
      var expectedResult = (new Buffer('{}')).toString('base64')
      expect(objectToBase64({})).to.equal(expectedResult)
    })
  })

  describe('generateUUID', function () {
    it('generates a valid UUID', function () {
      var uuidRegex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i
      expect(uuidRegex.test(generateUUID())).to.equal(true)
    })
  })
})
