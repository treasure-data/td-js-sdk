import Page from '../pageobjects/page'

class RequestPage extends Page {
  open () {
    return super.open('fixtures/request')
  }
}

export default new RequestPage()
