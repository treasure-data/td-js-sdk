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
    var uuidFunctions = generateUUID.isCryptoAvailable
      ? [generateUUID.cryptoUUID, generateUUID.genericUUID]
      : [generateUUID.genericUUID]
    uuidFunctions.forEach(function (uuidFunction) {
      it('generates a valid UUID for ' + uuidFunction.name, function () {
        var uuidRegex = /^[A-F0-9]{8}(?:-?[A-F0-9]{4}){3}-?[A-F0-9]{12}$/i
        expect(uuidRegex.test(uuidFunction())).to.equal(true)
      })
      it('generate non colliding UUID for ' + uuidFunction.name, function () {
        this.timeout(60000)
        var alreadyGenerated = {}
        for (var i = 0; i < 100000; i++) {
          var uuid = uuidFunction()
          expect(alreadyGenerated[uuid]).to.be(undefined)
          alreadyGenerated[uuid] = true
        }
      })
    })
  })
})
