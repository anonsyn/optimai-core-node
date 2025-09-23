import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { isMac } from '../../utils/os'
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
        if (isMac) {
          app.dock.hide()
        }
      }
    })
    ipcMain.on(WindowEvents.Minimize, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window) {
        window.minimize()
      }
    })
    ipcMain.on(WindowEvents.Maximize, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window) {
        window.maximize()
      }
    })
    ipcMain.on(WindowEvents.Hide, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window) {
        window.hide()
        if (isMac) {
          app.dock.hide()
        }
      }
    })

    // Native traffic light controls (macOS only)
    ipcMain.on(WindowEvents.ShowTrafficLights, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window && isMac) {
        window.setWindowButtonVisibility(true)
      }
    })

    ipcMain.on(WindowEvents.HideTrafficLights, (e) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window && isMac) {
        window.setWindowButtonVisibility(false)
      }
    })

    ipcMain.on(WindowEvents.SetTrafficLightPosition, (e, position: { x: number; y: number }) => {
      const window = BrowserWindow.fromWebContents(e.sender)
      if (window && isMac) {
        window.setWindowButtonPosition(position)
      }
    })
  }
}

const windowIpcHandler = new WindowIpcHandler()

export default windowIpcHandler
