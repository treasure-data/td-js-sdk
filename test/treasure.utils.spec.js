var expect = require('expect.js')
var objectToBase64 = require('../lib/utils/objectToBase64')
var generateUUID = require('../lib/utils/generateUUID')
var checkUUID = require('../lib/utils/checkUUID')

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

  describe('checkUUID', function () {
    it('will pass on a valid UUID', function () {
      expect(checkUUID(generateUUID())).to.equal(true)
    })

    it('will have failure conditions', function () {
      expect(
        [undefined, 'undefined', null, 'null', 1, Math.PI, '', 'abc', NaN, 'NaN', {},
        '00000000-0000-4000-8000-000000000000', '00000001-0002-4000-8000-000000000000']
          .map(checkUUID)
          .every(result => result === false))
        .to.equal(true)
    })

    it('will fail on a sufficiently un-chaotic value', function () {
      expect(checkUUID('00000000-0000-4000-8000-000000000000')).to.equal(false)
    })
  })
})
