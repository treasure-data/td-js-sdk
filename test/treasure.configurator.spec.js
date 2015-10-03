var expect = require('expect.js')
var Treasure = require('../lib/treasure')

describe('Treasure Configurator', function () {
  var treasure

  beforeEach(function () {
    treasure = new Treasure({
      database: 'database',
      writeKey: 'writeKey',
      development: true,
      logging: false
    })
  })

  describe('#set', function () {
    it('should let you set a $global attribute', function () {
      treasure.set('$global', 'attr', 'value')
      expect(treasure.get('$global', 'attr')).to.equal('value')
    })

    it('should let you set an attribute on a table', function () {
      treasure.set('table', 'attrA', 'valueA')
      treasure.set('table', 'attrB', 'valueB')
      expect(treasure.get('table', 'attrA')).to.equal('valueA')
      expect(treasure.get('table', 'attrB')).to.equal('valueB')
    })

    it('should let you set multiple $global attributes implicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      })
      expect(treasure.get('$global', 'foo')).to.equal('1')
      expect(treasure.get('$global', 'bar')).to.equal('2')
    })

    it('should let you set multiple $global attributes explicitly', function () {
      treasure.set('$global', {
        foo: '1',
        bar: '2'
      })
      expect(treasure.get('$global', 'foo')).to.equal('1')
      expect(treasure.get('$global', 'bar')).to.equal('2')
    })

    it('should let you set multiple $global attributes using both forms', function () {
      treasure.set('$global', {
        foo: '1'
      })
      treasure.set({
        bar: '2'
      })
      expect(treasure.get('$global', 'foo')).to.equal('1')
      expect(treasure.get('$global', 'bar')).to.equal('2')
    })

    it('should let you set multiple attributes on a table', function () {
      treasure.set('table', {
        foo: '1'
      })
      treasure.set('table', {
        bar: '2'
      })
      expect(treasure.get('table', 'foo')).to.equal('1')
      expect(treasure.get('table', 'bar')).to.equal('2')
    })
  })

  describe('#get', function () {
    var getKeys = function (obj) {
      var keys = []
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key)
        }
      }
      return keys
    }

    it('should return an empty object if nothing is set', function () {
      expect(treasure.get()).to.be.an('object')
      expect(treasure.get('table')).to.be.an('object')

      expect(getKeys(treasure.get())).to.have.length(0)
      expect(getKeys(treasure.get('table'))).to.have.length(0)
    })

    it('should let you get a $global attribute', function () {
      treasure.set('$global', 'attr', 'value')
      expect(treasure.get('$global', 'attr')).to.equal('value')
    })

    it('should let you get a table attribute', function () {
      treasure.set('table', 'attrA', 'valueA')
      treasure.set('table', 'attrB', 'valueB')
      expect(treasure.get('table', 'attrA')).to.equal('valueA')
      expect(treasure.get('table', 'attrB')).to.equal('valueB')
    })

    it('should let you get all $global attributes implicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      })
      expect(treasure.get()).to.be.an('object')
      expect(treasure.get()).to.have.property('foo', '1')
      expect(treasure.get()).to.have.property('bar', '2')
      expect(getKeys(treasure.get())).to.have.length(2)
    })

    it('should let you get all $global attributes explicitly', function () {
      treasure.set({
        foo: '1',
        bar: '2'
      })
      expect(treasure.get('$global')).to.be.an('object')
      expect(treasure.get('$global')).to.have.property('foo', '1')
      expect(treasure.get('$global')).to.have.property('bar', '2')
      expect(getKeys(treasure.get('$global'))).to.have.length(2)
    })

    it('should let you get all table attributes', function () {
      treasure.set('table', {
        foo: '1',
        bar: '2'
      })
      treasure.set('table', {
        baz: '3',
        qux: '4'
      })
      expect(treasure.get('table')).to.be.an('object')
      expect(treasure.get('table')).to.have.property('foo', '1')
      expect(treasure.get('table')).to.have.property('bar', '2')
      expect(treasure.get('table')).to.have.property('baz', '3')
      expect(treasure.get('table')).to.have.property('qux', '4')
    })
  })
})
