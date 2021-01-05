import Page from '../pageobjects/page'

class ClickPage extends Page {
  open () {
    return super.open('fixtures/clicks')
  }

  setStatusText (txt) {
    $('.status').innerHTML = txt
  }

  getButton () {
    return $('.btn')
  }
}

export default new ClickPage()
