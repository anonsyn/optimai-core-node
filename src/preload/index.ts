import { authIPC } from '@main/ipc/auth/preload'
import { browserIPC } from '@main/ipc/browser/preload'
import { nodeIPC } from '@main/ipc/node/preload'
import { updaterIPC } from '@main/ipc/updater/preload'
import { windowIPC } from '@main/ipc/window/preload'
import { contextBridge } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('windowIPC', windowIPC)
    contextBridge.exposeInMainWorld('browserIPC', browserIPC)
    contextBridge.exposeInMainWorld('updaterIPC', updaterIPC)
    contextBridge.exposeInMainWorld('authIPC', authIPC)
    contextBridge.exposeInMainWorld('nodeIPC', nodeIPC)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.windowIPC = windowIPC
  // @ts-ignore (define in dts)
  window.browserIPC = browserIPC
  // @ts-ignore (define in dts)
  window.updaterIPC = updaterIPC
  // @ts-ignore (define in dts)
  window.authIPC = authIPC
  // @ts-ignore (define in dts)
  window.nodeIPC = nodeIPC
}
