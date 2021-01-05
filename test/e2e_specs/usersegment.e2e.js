import usersegmentPage from '../pageobjects/usersegment.page'
import { TIMEOUT, status, isRequestFinished } from '../pageobjects/utils'

describe('Personalization api', () => {
  it('should send data successfully', () => {
    usersegmentPage.open()

    let statusElement = usersegmentPage.getStatus()
    statusElement.waitUntil(isRequestFinished(usersegmentPage), { timeout: TIMEOUT })

    expect(usersegmentPage.getStatusText()).toEqual(status.SUCCESS)
  })
})
