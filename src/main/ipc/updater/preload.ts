import { ipcRenderer } from 'electron'
import { createPreloadEventListener } from '../../utils/ipc'
import { UpdaterEvents } from './events'
import { UpdateState } from './types'

const updaterIPC = {
  checkForUpdateAndNotify: () => ipcRenderer.send(UpdaterEvents.CheckForUpdateAndNotify),
  startUpdate: () => ipcRenderer.send(UpdaterEvents.StartUpdate),
  quitAndInstall: () => ipcRenderer.send(UpdaterEvents.QuitAndInstall),
  onStateChange: (callback: (state: UpdateState) => void) =>
    createPreloadEventListener(UpdaterEvents.OnStateChange, callback)
}

type UpdaterIPC = typeof updaterIPC

export { updaterIPC, type UpdaterIPC }
