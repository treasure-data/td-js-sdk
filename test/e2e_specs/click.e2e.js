import clickPage from '../pageobjects/click.page'
import { TIMEOUT, status, isRequestFinished } from '../pageobjects/utils'

describe('Click tracking', () => {
  it('should send data successfully', () => {
    clickPage.open()

    let button = clickPage.getButton()
    button.click()

    let statusElement = clickPage.getStatus()
    statusElement.waitUntil(isRequestFinished(clickPage), { timeout: TIMEOUT })

    expect(clickPage.getStatusText()).toEqual(status.SUCCESS)
  })
})
