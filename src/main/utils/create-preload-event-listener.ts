import { ipcRenderer } from 'electron'

export const createPreloadEventListener = <T extends CallableFunction = CallableFunction>(
  event: string,
  callback: T
) => {
  const listener = (_: any, ...args: any) => {
    callback(...args)
  }

  ipcRenderer.on(event, listener)
  return {
    unsubscribe: () => {
      ipcRenderer.off(event, listener)
    }
  }
}
