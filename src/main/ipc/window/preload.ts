import { ipcRenderer } from 'electron'
import { WindowEvents } from './events'

const windowIPC = {
  openExternalLink: (url: string) => ipcRenderer.send(WindowEvents.OpenExternalLink, url),
  close: () => ipcRenderer.send(WindowEvents.Close)
}

type WindowIPC = typeof windowIPC

export { windowIPC, type WindowIPC }
