import { ipcRenderer } from 'electron'
import { BrowserEvents } from './events'

interface BrowserViewBounds {
  x: number
  y: number
  width: number
  height: number
}

interface NewWindowHandlerOptions {
  allowSameOrigin?: boolean
  allowExternal?: boolean
  navigateInCurrentView?: boolean
}

const browserIPC = {
  showBrowserView: (bounds?: BrowserViewBounds) =>
    ipcRenderer.send(BrowserEvents.ShowBrowserView, bounds),
  hideBrowserView: () => ipcRenderer.send(BrowserEvents.HideBrowserView),
  destroyBrowserView: () => ipcRenderer.send(BrowserEvents.DestroyBrowserView),
  navigateToUrl: (url: string) => ipcRenderer.send(BrowserEvents.NavigateToUrl, url),
  canGoBack: () => ipcRenderer.invoke(BrowserEvents.CanGoBack),
  canGoForward: () => ipcRenderer.invoke(BrowserEvents.CanGoForward),
  goBack: () => ipcRenderer.send(BrowserEvents.GoBack),
  goForward: () => ipcRenderer.send(BrowserEvents.GoForward),
  reload: () => ipcRenderer.send(BrowserEvents.Reload),
  getCurrentUrl: () => ipcRenderer.invoke(BrowserEvents.GetCurrentUrl),
  getAllTabs: () => ipcRenderer.invoke(BrowserEvents.GetAllTabs)
}

type BrowserIPC = typeof browserIPC

export { browserIPC, type BrowserIPC, type BrowserViewBounds, type NewWindowHandlerOptions }
