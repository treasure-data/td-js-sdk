import eventPage from '../pageobjects/event.page'
import { TIMEOUT, status, isRequestFinished } from '../pageobjects/utils'

describe('Event tracking', () => {
  it('should send data successfully', () => {
    eventPage.open()

    let statusElement = eventPage.getStatus()
    statusElement.waitUntil(isRequestFinished(eventPage), { timeout: TIMEOUT })

    expect(eventPage.getStatusText()).toEqual(status.SUCCESS)
  })
})
