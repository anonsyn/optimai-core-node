import { ipcRenderer } from 'electron'
import { WindowEvents } from './events'

const windowIPC = {
  openExternalLink: (url: string) => ipcRenderer.send(WindowEvents.OpenExternalLink, url)
}

type WindowIPC = typeof windowIPC

export { windowIPC, type WindowIPC }
