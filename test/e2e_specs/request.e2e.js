import requestPage from '../pageobjects/event.page'
import { TIMEOUT, status, isRequestFinished } from '../pageobjects/utils'

describe('addRecord api', () => {
  it('should send data successfully', () => {
    requestPage.open()

    let statusElement = requestPage.getStatus()
    statusElement.waitUntil(isRequestFinished(requestPage), { timeout: TIMEOUT })

    expect(requestPage.getStatusText()).toEqual(status.SUCCESS)
  })
})
