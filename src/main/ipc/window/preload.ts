import { ipcRenderer } from 'electron'
import { WindowEvents } from './events'

const windowIPC = {
  openExternalLink: (url: string) => ipcRenderer.send(WindowEvents.OpenExternalLink, url),
  close: () => ipcRenderer.send(WindowEvents.Close),
  minimize: () => ipcRenderer.send(WindowEvents.Minimize),
  maximize: () => ipcRenderer.send(WindowEvents.Maximize),
  hide: () => ipcRenderer.send(WindowEvents.Hide)
}

type WindowIPC = typeof windowIPC

export { windowIPC, type WindowIPC }
