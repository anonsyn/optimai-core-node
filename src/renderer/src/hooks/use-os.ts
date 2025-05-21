import { OS, getOS } from '@/utils/os'

export const useOs = () => {
  const os = getOS()

  return {
    os,
    isMac: os === OS.MAC,
    isWindows: os === OS.WINDOWS,
    isLinux: os === OS.LINUX
  }
}
