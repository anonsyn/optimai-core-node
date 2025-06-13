import { ipcMain } from 'electron'
import browserTabManager from '../../browser/tabManager'
import { BrowserEvents } from './events'

class BrowserIpcHandler {
  initialize() {
    ipcMain.on(BrowserEvents.ShowBrowserView, (_event, bounds?: any) => {
      browserTabManager.showBrowserView(bounds)
    })

    ipcMain.on(BrowserEvents.HideBrowserView, () => {
      browserTabManager.hideBrowserView()
    })

    ipcMain.on(BrowserEvents.DestroyBrowserView, () => {
      const active = browserTabManager.getActiveTabId()
      if (active !== null) {
        browserTabManager.closeTab(active)
      }
    })

    ipcMain.on(BrowserEvents.NavigateToUrl, (_, url: string) => {
      browserTabManager.navigateActive(url)
    })

    ipcMain.on(BrowserEvents.GoBack, () => {
      browserTabManager.goBackActive()
    })

    ipcMain.handle(BrowserEvents.CanGoBack, () => {
      const state = browserTabManager.getActiveTab()?.state
      return state?.canGoBack || false
    })

    ipcMain.handle(BrowserEvents.CanGoForward, () => {
      const state = browserTabManager.getActiveTab()?.state
      return state?.canGoForward || false
    })

    ipcMain.on(BrowserEvents.GoForward, () => {
      browserTabManager.goForwardActive()
    })

    ipcMain.on(BrowserEvents.Reload, () => {
      browserTabManager.reloadActive()
    })

    ipcMain.handle(BrowserEvents.GetCurrentUrl, () => {
      return browserTabManager.getActiveTab()?.state.url || null
    })

    ipcMain.handle(BrowserEvents.GetAllTabs, () => {
      return browserTabManager.getAllTabStates()
    })
  }
}

const browserIpcHandler = new BrowserIpcHandler()

export default browserIpcHandler
