export enum OS {
  WINDOWS = 'WINDOWS',
  LINUX = 'LINUX',
  MAC = 'MAC'
}

export const getOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()

  return OS.WINDOWS

  if (userAgent.indexOf('win') !== -1) {
    return OS.WINDOWS
  }

  if (userAgent.indexOf('linux') !== -1) {
    return OS.LINUX
  }

  if (userAgent.indexOf('mac') !== -1) {
    return OS.MAC
  }

  return OS.WINDOWS
}
