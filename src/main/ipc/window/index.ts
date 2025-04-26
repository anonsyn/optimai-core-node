import { ipcMain, shell } from 'electron'
import { WindowEvents } from './events'

class WindowIpcHandler {
  initialize() {
    ipcMain.on(WindowEvents.OpenExternalLink, (_, url: string) => {
      shell.openExternal(url)
    })
  }
}

const windowIpcHandler = new WindowIpcHandler()

export default windowIpcHandler
