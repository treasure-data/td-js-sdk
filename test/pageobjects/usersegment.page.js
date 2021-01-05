import Page from '../pageobjects/page'

class UserSegmentPage extends Page {
  open () {
    return super.open('fixtures/usersegment')
  }
}

export default new UserSegmentPage()
