import EventEmitter from 'eventemitter3'
import { BehaviorSubject, Observable } from 'rxjs'
import windowManager from '../window/manager'
import { WindowType } from '../window/window'
import type { BrowserTab, TabState } from './tab'
import { createBrowserTab } from './tabFactory'
import type { BrowserDataOptions, BrowserViewBounds, NewWindowHandlerOptions } from './types'

class BrowserTabManager extends EventEmitter {
  private tabs = new Map<number, BrowserTab>()
  private activeTabId: number | null = null
  private nextTabId = 1

  private dataOptions: BrowserDataOptions = {
    dataFolderName: 'browser-data',
    clearDataOnStartup: false,
    usePrivateSession: false
  }

  readonly newWindowOptions: NewWindowHandlerOptions = {
    allowSameOrigin: true,
    allowExternal: true,
    navigateInCurrentView: false
  }

  private _activeTabIdSubject = new BehaviorSubject<number | null>(null)

  get activeTabId$(): Observable<number | null> {
    return this._activeTabIdSubject.asObservable()
  }

  // ------------- CONFIGURATION -------------------------------------------

  setDataOptions(options: Partial<BrowserDataOptions>) {
    this.dataOptions = { ...this.dataOptions, ...options }
  }

  // ------------- TAB OPERATIONS -----------------------------------------

  createTab(initialUrl = 'https://www.google.com'): number {
    const id = this.nextTabId++
    const tab = createBrowserTab(id, initialUrl, this.dataOptions, this.newWindowOptions)
    this.tabs.set(id, tab)

    // Register state change propagation
    tab.on('state-changed', (state: TabState) => {
      this.emit('tab-state-changed', id, state)
    })

    this.emit('tab-added', tab)

    // Auto focus newly created tab
    this.focusTab(id)

    return id
  }

  focusTab(id: number) {
    if (this.activeTabId === id) return

    const mainWindow = windowManager.getWindowByType(WindowType.CoreNode)
    if (!mainWindow) return

    const targetTab = this.tabs.get(id)
    if (!targetTab) return

    // Hide currently active tab view
    if (this.activeTabId !== null) {
      const prevTab = this.tabs.get(this.activeTabId)
      if (prevTab && mainWindow.contentView.children.includes(prevTab.view)) {
        mainWindow.contentView.removeChildView(prevTab.view)
      }
    }

    // Show target tab view
    if (!mainWindow.contentView.children.includes(targetTab.view)) {
      mainWindow.contentView.addChildView(targetTab.view)
    }

    // Ensure bounds fit window
    const winBounds = mainWindow.getBounds()
    targetTab.view.setBounds({ x: 0, y: 0, width: winBounds.width, height: winBounds.height })

    this.activeTabId = id
    this._activeTabIdSubject.next(this.activeTabId)
    this.emit('active-tab-changed', targetTab)
  }

  closeTab(id: number) {
    const tab = this.tabs.get(id)
    if (!tab) return

    const mainWindow = windowManager.getWindowByType(WindowType.CoreNode)
    if (mainWindow && mainWindow.contentView.children.includes(tab.view)) {
      mainWindow.contentView.removeChildView(tab.view)
    }

    tab.destroy()
    this.tabs.delete(id)

    if (this.activeTabId === id) {
      // Activate another tab if exists
      const next = this.tabs.keys().next().value as number | undefined
      if (next !== undefined) {
        this.focusTab(next)
      } else {
        this.activeTabId = null
        this._activeTabIdSubject.next(this.activeTabId)
      }
    }

    this.emit('tab-removed', id)
  }

  reloadActive() {
    const tab = this.getActiveTab()
    tab?.reload()
  }

  goBackActive() {
    const tab = this.getActiveTab()
    tab?.goBack()
  }

  goForwardActive() {
    const tab = this.getActiveTab()
    tab?.goForward()
  }

  navigateActive(url: string) {
    const tab = this.getActiveTab()
    tab?.navigate(url)
  }

  // ------------- GETTERS --------------------------------------------------

  getActiveTabId(): number | null {
    return this.activeTabId
  }

  getActiveTab(): BrowserTab | undefined {
    return this.activeTabId !== null ? this.tabs.get(this.activeTabId) : undefined
  }

  getTab(id: number): BrowserTab | undefined {
    return this.tabs.get(id)
  }

  getTabState(id: number): TabState | undefined {
    return this.tabs.get(id)?.state
  }

  getAllTabs(): BrowserTab[] {
    return Array.from(this.tabs.values())
  }

  // ----------------- VIEW ATTACH / DETACH ------------------------------

  /**
   * Attach the active tab's view to the window. Optionally set bounds.
   */
  showBrowserView(bounds?: BrowserViewBounds) {
    if (this.getActiveTabId() === null) {
      this.createTab()
    }

    const activeId = this.getActiveTabId()
    if (activeId !== null) this.focusTab(activeId)

    if (bounds) {
      const tab = this.getActiveTab()
      tab?.view.setBounds(bounds)
    }
  }

  /**
   * Detach the active tab view from the window; tab remains alive in memory.
   */
  hideBrowserView() {
    const tab = this.getActiveTab()
    if (!tab) return

    const mainWindow = windowManager.getWindowByType(WindowType.CoreNode)
    if (mainWindow && mainWindow.contentView.children.includes(tab.view)) {
      mainWindow.contentView.removeChildView(tab.view)
    }
  }

  // ----------------- COLLECTION HELPERS -------------------------------

  getAllTabStates(): TabState[] {
    return Array.from(this.tabs.values()).map((t) => t.state)
  }
}

const browserTabManager = new BrowserTabManager()

export default browserTabManager
