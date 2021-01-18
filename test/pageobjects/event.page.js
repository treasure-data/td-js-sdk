import Page from '../pageobjects/page'

class EventPage extends Page {
  open () {
    return super.open('fixtures/event')
  }
}

export default new EventPage()
