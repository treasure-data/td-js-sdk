import Page from '../pageobjects/page'

class EventPage extends Page {
  open () {
    return super.open('fixtures/event')
  }

  getStatus () {
    return $('.status')
  }

  getStatusText () {
    return $('.status').getText()
  }
}

export default new EventPage()
