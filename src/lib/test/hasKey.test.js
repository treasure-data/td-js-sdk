var test = require('tape-catch')
var hasKey = require('../hasKey')

test('hasKey instance', function (t) {
  function TestClass () {
    this.property = true
  }
  TestClass.prototype.method = function method () {}

  t.plan(2)
  var instance = new TestClass()
  t.notOk(hasKey(instance, 'method'))
  t.ok(hasKey(instance, 'property'))
})

test('hasKey object', function (t) {
  t.plan(2)
  var object = { a: true }
  t.ok(hasKey(object, 'a'))
  t.notOk(hasKey(object, 'b'))
})
