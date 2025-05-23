import os from 'os'

enum OS {
  MAC = 'mac',
  WIN = 'win',
  LINUX = 'linux'
}

const getOS = () => {
  const platform = os.platform()

  switch (platform) {
    case 'darwin':
      return OS.MAC
    case 'win32':
      return OS.WIN
    case 'linux':
      return OS.LINUX
  }

  return OS.WIN
}

const isWindows = getOS() === OS.WIN

const isMac = getOS() === OS.MAC

const isLinux = getOS() === OS.LINUX

export { getOS, isLinux, isMac, isWindows, OS }
