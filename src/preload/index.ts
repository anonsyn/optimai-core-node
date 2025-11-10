import { authIPC } from '@main/ipc/auth/preload'
import { dockerIPC } from '@main/ipc/docker/preload'
import { nodeIPC } from '@main/ipc/node/preload'
import { reportsIPC } from '@main/ipc/reports/preload'
import { updaterIPC } from '@main/ipc/updater/preload'
import { windowIPC } from '@main/ipc/window/preload'
import { contextBridge } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
try {
  contextBridge.exposeInMainWorld('windowIPC', windowIPC)
  contextBridge.exposeInMainWorld('updaterIPC', updaterIPC)
  contextBridge.exposeInMainWorld('authIPC', authIPC)
  contextBridge.exposeInMainWorld('nodeIPC', nodeIPC)
  contextBridge.exposeInMainWorld('dockerIPC', dockerIPC)
  contextBridge.exposeInMainWorld('reportsIPC', reportsIPC)
} catch (error) {
  console.error(error)
}
