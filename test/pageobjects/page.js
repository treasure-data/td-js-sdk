export default class Page {
  open (path) {
    return browser.url(`http://{host}:5000/${path}`)
  }

  getStatus () {
    return $('.status')
  }

  getStatusText () {
    return $('.status').getText()
  }
}
