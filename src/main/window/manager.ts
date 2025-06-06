import { WebContents } from 'electron'
import OptimaiBrowserWindow, { WindowType } from './window'

class WindowManager {
  private windows: OptimaiBrowserWindow[] = []

  addWindow(window: OptimaiBrowserWindow) {
    window.on('closed', () => {
      this.removeWindow(window)
    })
    this.windows.push(window)
  }

  removeWindow(window: OptimaiBrowserWindow) {
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
  getWindowByType(type: WindowType) {
    return this.windows.find((w) => w.type === type)
  }

  getVisibleWindow() {
    return this.windows.find((w) => w.isVisible())
  }
}

const windowManager = new WindowManager()

export default windowManager
