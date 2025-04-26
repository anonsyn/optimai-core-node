import { windowIPC } from '@main/ipc/window/preload'
import { contextBridge } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
console.log({ hi: process.contextIsolated })
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('windowIPC', windowIPC)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.windowIPC = windowIPC
}
