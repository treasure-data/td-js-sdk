var Buffer = require('buffer').Buffer
var test = require('tape-catch')
var base64 = require('./base64')

test('base64.encode', function (t) {
  t.plan(2)

  var ramen = 'ラーメン'
  t.equal(base64.encode(ramen), new Buffer(ramen).toString('base64'))

  var json = JSON.stringify({ ramen: ramen })
  t.equal(base64.encode(json), new Buffer(json).toString('base64'))
})
