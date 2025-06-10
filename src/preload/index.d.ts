import { type AuthIPC } from '../main/ipc/auth/preload'
import { type WindowIPC as BrowserIPC } from '../main/ipc/browser/preload'
import { type NodeIPC } from '../main/ipc/node/preload'
import { type UpdaterIPC } from '../main/ipc/updater/preload'
import { type WindowIPC } from '../main/ipc/window/preload'

declare global {
  interface Window {
    windowIPC: WindowIPC
    browserIPC: BrowserIPC
    updaterIPC: UpdaterIPC
    authIPC: AuthIPC
    nodeIPC: NodeIPC
  }
}
