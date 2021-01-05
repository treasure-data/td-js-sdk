import pageviewPage from '../pageobjects/pageview.page'
import { TIMEOUT, status, isRequestFinished } from '../pageobjects/utils'

describe('Pageview tracking', () => {
  it('should send data successfully', () => {
    pageviewPage.open()

    let statusElement = pageviewPage.getStatus()
    statusElement.waitUntil(isRequestFinished(pageviewPage), { timeout: TIMEOUT })

    expect(pageviewPage.getStatusText()).toEqual(status.SUCCESS)
  })
})
