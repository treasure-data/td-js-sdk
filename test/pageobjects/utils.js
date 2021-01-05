export const TIMEOUT = 30000

export const status = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  RUNNING: 'running'
}

export const isRequestFinished = (page) => {
  return () => {
    return page.getStatusText() !== status.RUNNING
  }
}
