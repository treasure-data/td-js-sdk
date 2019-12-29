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

    var methods = ['blockEvents', 'fetchServerCookie', 'unblockEvents', 'setSignedMode', 'setAnonymousMode', 'resetUUID', 'addRecord', 'fetchGlobalID', 'set', 'trackEvent', 'trackPageview', 'trackClicks', 'ready']
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i]
      c[n].prototype[method] = action(method)
    }

    // https://calendar.perfplanet.com/2018/a-csp-compliant-non-blocking-script-loader/

    var where = document.currentScript || document.getElementsByTagName('script')[0]
    var iframe = document.createElement('iframe')
    var win, doc, dom, s, bootstrap
    var iframeId = 'td-iframe-async'

    // IE6, which does not support CSP, treats about:blank as insecure content, so we'd have to use javascript:void(0) there
    // In browsers that do support CSP, javascript:void(0) is considered unsafe inline JavaScript, so we prefer about:blank
    iframe.src = 'javascript:false'

    // We set title and role appropriately to play nicely with screen readers and other assistive technologies
    iframe.title = ''
    iframe.role = 'presentation'

    s = (iframe.frameElement || iframe).style
    s.width = 0; s.height = 0; s.border = 0; s.display = 'none'

    where.parentNode.insertBefore(iframe, where)
    try {
      win = iframe.contentWindow
      doc = win.document.open()
    } catch (e) {
      // document.domain has been changed and we're on an old version of IE, so we got an access denied.
      // Note: the only browsers that have this problem also do not have CSP support.

      // Get document.domain of the parent window
      dom = document.domain

      // Set the src of the iframe to a JavaScript URL that will immediately set its document.domain to match the parent.
      // This lets us access the iframe document long enough to inject our script.
      // Our script may need to do more domain massaging later.
      iframe.src = 'javascript:var d=document.open();d.domain="' + dom + '";void(0);'
      win = iframe.contentWindow
      doc = win.document.open()
    }

    bootstrap = function () {
      // This code runs inside the iframe
      var js = doc.createElement('script')
      js.id = iframeId
      js.src = (document.location.protocol === 'https:'
        ? 'https:'
        : 'http:'
      ) + '@URL'
      doc.body.appendChild(js)
    }

    try {
      win._l = bootstrap

      if (win.addEventListener) {
        win.addEventListener('load', win._l, false)
      } else if (win.attachEvent) {
        win.attachEvent('onload', win._l)
      }
    } catch (f) {
      // unsafe version for IE8 compatability
      // If document.domain has changed, we can't use win, but we can use doc
      doc._l = function () {
        if (dom) {
          this.domain = dom
        }
        bootstrap()
      }
      doc.write('<body onload="document._l();">')
    }
    doc.close()
  }
})('@GLOBAL', this)
