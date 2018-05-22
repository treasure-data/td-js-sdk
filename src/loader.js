(function (n, c) {
  if (c[n] === void 0) {
    c[n] = function () {
      c[n].clients.push(this)
      this._init = [Array.prototype.slice.call(arguments)]
    }
    c[n].clients = []

    var action = function (method) {
      return function () {
        this['_' + method] = this['_' + method] || []
        this['_' + method].push(Array.prototype.slice.call(arguments))
        return this
      }
    }

    var methods = ['blockEvents', 'unblockEvents', 'setSignedMode', 'setAnonymousMode', 'resetUUID', 'addRecord', 'fetchGlobalID', 'set', 'trackEvent', 'trackPageview', 'trackClicks', 'ready']
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i]
      c[n].prototype[method] = action(method)
    }

    var s = document.createElement('script')
    s.type = 'text/javascript'
    s.async = !0
    s.src = (
      document.location.protocol === 'https:'
        ? 'https:'
        : 'http:'
    ) + '@URL'

    var t = document.getElementsByTagName('script')[0]
    t.parentNode.insertBefore(s, t)
  }
})('@GLOBAL', this)
