var test = require('tape-catch')
var forEach = require('../forEach')

test('forEach array', function (t) {
  t.plan(5)
  var array = [10, 20, 30]
  var indexes = []
  var values = []
  forEach(array, function (value, index, collection) {
    values.push(value)
    indexes.push(index)
    t.equal(collection, array)
  })
  t.deepEqual(indexes, [0, 1, 2], 'array index')
  t.deepEqual(values, [10, 20, 30], 'array value')
})

test('forEach object', function (t) {
  t.plan(5)
  var object = { a: 10, b: 20, c: 30 }
  var keys = []
  var values = []
  forEach(object, function (value, key, collection) {
    values.push(value)
    keys.push(key)
    t.equal(collection, object)
  })
  t.deepEqual(keys, ['a', 'b', 'c'], 'object keys')
  t.deepEqual(values, [10, 20, 30], 'object values')
})

test('forEach invalid', function (t) {
  t.plan(1)
  t.throws(function () {
    forEach(null)
  }, /TypeError/)
})
