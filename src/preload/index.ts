import { updaterIPC } from '@main/ipc/updater/preload'
import { windowIPC } from '@main/ipc/window/preload'
import { contextBridge } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('windowIPC', windowIPC)
    contextBridge.exposeInMainWorld('updaterIPC', updaterIPC)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.windowIPC = windowIPC
  // @ts-ignore (define in dts)
  window.updaterIPC = updaterIPC
}
