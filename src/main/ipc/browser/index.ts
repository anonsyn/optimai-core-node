import { ipcMain } from 'electron'
import browserViewManager, {
  type BrowserViewBounds,
  type NewWindowHandlerOptions
} from '../../browser/manager'
import { BrowserEvents } from './events'

class BrowserIpcHandler {
  initialize() {
    ipcMain.on(BrowserEvents.ShowBrowserView, () => {
      browserViewManager.showBrowserView()
    })

    ipcMain.on(BrowserEvents.ShowBrowserViewWithBounds, (_, bounds: BrowserViewBounds) => {
      browserViewManager.showBrowserView(bounds)
    })

    ipcMain.on(BrowserEvents.HideBrowserView, () => {
      browserViewManager.hideBrowserView()
    })

    ipcMain.on(BrowserEvents.DestroyBrowserView, () => {
      browserViewManager.destroyBrowserView()
    })

    ipcMain.on(BrowserEvents.NavigateToUrl, (_, url: string) => {
      const webContentsView = browserViewManager.webContentsView
      if (webContentsView) {
        webContentsView.webContents.loadURL(url)
      }
    })

    ipcMain.on(BrowserEvents.GoBack, () => {
      const webContentsView = browserViewManager.webContentsView
      if (webContentsView && webContentsView.webContents.navigationHistory.canGoBack()) {
        webContentsView.webContents.goBack()
      }
    })

    ipcMain.handle(BrowserEvents.CanGoBack, () => {
      const webContentsView = browserViewManager.webContentsView
      return webContentsView?.webContents.navigationHistory.canGoBack() || false
    })

    ipcMain.handle(BrowserEvents.CanGoForward, () => {
      const webContentsView = browserViewManager.webContentsView
      return webContentsView?.webContents.navigationHistory.canGoForward() || false
    })

    ipcMain.on(BrowserEvents.GoForward, () => {
      const webContentsView = browserViewManager.webContentsView
      if (webContentsView && webContentsView.webContents.navigationHistory.canGoForward()) {
        webContentsView.webContents.goForward()
      }
    })

    ipcMain.on(BrowserEvents.Reload, () => {
      const webContentsView = browserViewManager.webContentsView
      if (webContentsView) {
        webContentsView.webContents.reload()
      }
    })

    ipcMain.handle(BrowserEvents.GetCurrentUrl, () => {
      const webContentsView = browserViewManager.webContentsView
      return webContentsView?.webContents.getURL() || null
    })

    ipcMain.on(
      BrowserEvents.SetNewWindowOptions,
      (_, options: Partial<NewWindowHandlerOptions>) => {
        browserViewManager.setNewWindowOptions(options)
      }
    )
  }
}

const browserIpcHandler = new BrowserIpcHandler()

export default browserIpcHandler
