import { BrowserWindow, WebContents } from 'electron'

class WindowManager {
  private windows: BrowserWindow[] = []

  addWindow(window: BrowserWindow) {
    window.on('closed', () => {
      this.removeWindow(window)
    })
    this.windows.push(window)
  }

  removeWindow(window: BrowserWindow) {
    this.windows = this.windows.filter((w) => w !== window)
  }
  windowFromContents(contents: WebContents) {
    return this.windows.find((w) => w.webContents.id === contents.id)
  }
  destroyAllWindows() {
    this.windows.forEach((window) => {
      window.destroy()
    })
  }
}

const windowManager = new WindowManager()

export default windowManager
