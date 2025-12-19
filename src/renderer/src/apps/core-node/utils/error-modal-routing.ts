const DOCKER_MODAL_ERROR_CODES = new Set(['DOCKER_2001', 'DOCKER_2002', 'DOCKER_2003', 'DOCKER_2004'])

export function shouldShowDockerNotRunningModal(errorCode?: string): boolean {
  if (!errorCode) return false
  if (errorCode === 'DOCKER_2005') return false
  return DOCKER_MODAL_ERROR_CODES.has(errorCode)
}

