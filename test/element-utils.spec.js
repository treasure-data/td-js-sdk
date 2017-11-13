var expect = require('expect.js')
var helpers = require('./helpers')
var elementUtils = require('../lib/utils/element')
var addEventListener = elementUtils.addEventListener
var createTreeHasIgnoreAttribute = elementUtils.createTreeHasIgnoreAttribute
var getElementData = elementUtils.getElementData
var getEventTarget = elementUtils.getEventTarget
var htmlElementAsString = elementUtils.htmlElementAsString
var htmlTreeAsString = elementUtils.htmlTreeAsString
var findElement = elementUtils.findElement
var createTestElement = helpers.createTestElement
var leafChild = helpers.leafChild

describe('Element Utils', function () {
  describe('addEventListener', function () {
    it('calls the event listener', function (done) {
      var button = createTestElement('button')
      addEventListener(button, 'click', handler)
      function handler (e) {
        expect(e instanceof window.Event).ok()
        done()
      }
      button.click()
    })

    it('fails if the element is invalid', function (done) {
      try {
        addEventListener(null, 'click', function () {})
        done(new Error('fail'))
      } catch (err) {
        done()
      }
    })

    it('removes the event listener', function () {
      var button = createTestElement('button')
      var removeEventListener = addEventListener(button, 'click', handler)

      var calls = 0
      function handler () {
        calls++
        expect(calls === 1).ok()
      }

      button.click()
      removeEventListener()
      button.click()
      expect(calls === 1).ok()
    })
  })

  describe('createTreeHasIgnoreAttribute', function () {
    var treeHasIgnoreAttribute = createTreeHasIgnoreAttribute('td-ignore')

    it('returns true if the root has the ignored attribute', function () {
      var div = document.createElement('div')
      div.setAttribute('td-ignore', true)
      expect(treeHasIgnoreAttribute(div)).ok()
    })

    it('returns true if the ignored attribute is present', function () {
      var div = document.createElement('div')
      div.setAttribute('td-ignore', false)
      expect(treeHasIgnoreAttribute(div)).ok()
    })

    it('returns true if any element has the ignored attribute', function () {
      var div = document.createElement('div')
      div.innerHTML = '<div td-ignore><div><div></div></div></div>'
      var leaf = div.children[0].children[0].children[0]
      expect(treeHasIgnoreAttribute(leaf)).ok()
    })

    it('returns true if the ignored attribute is prefixed with data-', function () {
      var div = document.createElement('div')
      div.setAttribute('data-td-ignore', true)
      expect(treeHasIgnoreAttribute(div)).ok()
    })

    it('returns false if the ignored attribute is missing', function () {
      var div = document.createElement('div')
      expect(!treeHasIgnoreAttribute(div)).ok()
    })
  })

  describe('findElement', function () {
    it('ignores div', function () {
      expect(findElement(document.createElement('div'))).not.ok()
    })

    it('ignores password inputs', function () {
      var input = document.createElement('input')
      input.type = 'password'
      expect(findElement(input)).not.ok()
    })

    it('accepts a', function () {
      expect(findElement(document.createElement('a'))).ok()
    })

    it('accepts button', function () {
      expect(findElement(document.createElement('button'))).ok()
    })

    it('accepts input', function () {
      expect(findElement(document.createElement('input'))).ok()
    })

    it('accepts button role', function () {
      var div = document.createElement('div')
      div.setAttribute('role', 'button')
      expect(findElement(div)).ok()
    })

    it('accepts link role', function () {
      var div = document.createElement('div')
      div.setAttribute('role', 'link')
      expect(findElement(div)).ok()
    })

    it('finds a wrapping link', function () {
      var div = document.createElement('div')
      var a = document.createElement('a')
      a.appendChild(div)
      expect(findElement(div)).to.equal(a)
    })

    it('does not error if it traverses a node without a tagName', function () {
      var fragment = document.createDocumentFragment()
      var span = document.createElement('span')
      fragment.appendChild(span)
      expect(function () { findElement(span) }).to.not.throwError()
      expect(findElement(span)).to.be(null)
    })
  })

  describe('getElementData', function () {
    it('gets tag', function () {
      var div = document.createElement('div')
      var data = getElementData(div)
      expect(data.tag === 'div').ok()
    })

    it('gets tree', function () {
      var div = createTestElement('div')
      div.innerHTML = '<div><div><div></div></div></div>'
      var leaf = div.children[0].children[0].children[0]
      var data = getElementData(leaf)
      expect(data.tree === 'body > div > div > div > div').ok()
    })

    it('gets alt', function () {
      var a = document.createElement('a')
      a.setAttribute('alt', 'foobar')
      var data = getElementData(a)
      expect(data.alt === 'foobar').ok()
    })

    it('gets class', function () {
      var div = document.createElement('div')
      div.setAttribute('class', 'foo bar baz')
      var data = getElementData(div)
      expect(data['class'] === 'foo bar baz').ok()
    })

    it('gets href', function () {
      var a = document.createElement('a')
      a.setAttribute('href', 'https://www.google.com/')
      var data = getElementData(a)
      expect(data.href === 'https://www.google.com/').ok()
    })

    it('gets id', function () {
      var div = document.createElement('div')
      div.setAttribute('id', 'foobar')
      var data = getElementData(div)
      expect(data.id === 'foobar').ok()
    })

    it('gets name', function () {
      var input = document.createElement('input')
      input.setAttribute('name', 'foobar')
      var data = getElementData(input)
      expect(data.name === 'foobar').ok()
    })

    it('gets role', function () {
      var div = document.createElement('div')
      div.setAttribute('role', 'button')
      var data = getElementData(div)
      expect(data.role === 'button')
    })

    it('gets title', function () {
      var button = document.createElement('button')
      button.setAttribute('title', 'foobar')
      var data = getElementData(button)
      expect(data.title === 'foobar').ok()
    })

    it('gets type', function () {
      var input = document.createElement('input')
      input.setAttribute('type', 'hidden')
      var data = getElementData(input)
      expect(data.type === 'hidden').ok()
    })
  })

  describe('htmlTreeAsString', function () {
    it('returns the tree up to five elements deep', function () {
      var div = document.createElement('div')
      div.innerHTML = '<h1><a><span><div></div></span></a></h1>'
      var leaf = leafChild(div)
      expect(htmlTreeAsString(leaf) === 'div > h1 > a > span > div').ok()
    })

    it('returns shallow trees', function () {
      var div = createTestElement('div')
      div.innerHTML = '<div></div>'
      var leaf = leafChild(div)
      expect(htmlTreeAsString(leaf) === 'body > div > div').ok()
    })
  })

  describe('htmlElementAsString', function () {
    it('includes classes', function () {
      var div = document.createElement('div')
      div.setAttribute('class', 'foo bar baz')
      expect(htmlElementAsString(div) === 'div.foo.bar.baz').ok()
    })

    it('includes id', function () {
      var div = document.createElement('div')
      div.setAttribute('id', 'foo')
      expect(htmlElementAsString(div) === 'div#foo').ok()
    })

    it('includes alt and title', function () {
      var a = document.createElement('a')
      a.setAttribute('title', 'foobar')
      a.setAttribute('alt', 'foobar')
      expect(htmlElementAsString(a) === 'a[title="foobar"][alt="foobar"]').ok()
    })

    it('includes name and type', function () {
      var button = document.createElement('button')
      button.setAttribute('type', 'button')
      button.setAttribute('name', 'foobar')
      expect(htmlElementAsString(button) === 'button[type="button"][name="foobar"]').ok()
    })
  })

  describe('getEventTarget', function () {
    it('handles children event targets', function (done) {
      var div = createTestElement('div')
      div.innerHTML = '<button>text</button>'
      var leaf = leafChild(div)
      addEventListener(div, 'click', function (e) {
        expect(getEventTarget(e) === leaf)
        done()
      })
      leaf.click()
    })

    it('handles direct events', function (done) {
      var button = createTestElement('button')
      button.innerHTML = '<div>text</div>'
      addEventListener(button, 'click', function (e) {
        expect(getEventTarget(e) === button)
        done()
      })
      button.click()
    })
  })
})
