import Page from '../pageobjects/page'

class EventPage extends Page {
  open () {
    return super.open('fixtures/pageview')
  }
}

export default new EventPage()
