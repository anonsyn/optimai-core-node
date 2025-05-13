import { BrowserWindow, ipcMain, shell } from 'electron'
import { WindowEvents } from './events'

class WindowIpcHandler {
  initialize() {
    ipcMain.on(WindowEvents.OpenExternalLink, (_, url: string) => {
      shell.openExternal(url)
    })
    ipcMain.on(WindowEvents.Close, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window) {
        window.hide()
      }
    })
  }
}

const windowIpcHandler = new WindowIpcHandler()

export default windowIpcHandler
