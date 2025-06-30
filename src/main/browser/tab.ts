import { WebContentsView, shell } from 'electron'
import EventEmitter from 'eventemitter3'
import { BehaviorSubject, Observable } from 'rxjs'

// Re-use options/types that already exist in manager.ts to avoid duplication
import type { BrowserDataOptions, NewWindowHandlerOptions } from './types'

export interface TabState {
  id: number
  url: string
  title: string
  favicon: string | null
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
}

export class BrowserTab extends EventEmitter {
  readonly id: number
  private _view: WebContentsView
  private dataOptions: BrowserDataOptions
  private newWindowOptions: NewWindowHandlerOptions

  // Public state that UI can consume
  private _state: TabState
  private _stateSubject: BehaviorSubject<TabState>

  constructor(
    id: number,
    initialUrl: string,
    dataOptions: BrowserDataOptions,
    newWindowOptions: NewWindowHandlerOptions
  ) {
    super()
    this.id = id
    this.dataOptions = dataOptions
    this.newWindowOptions = newWindowOptions

    this._state = {
      id,
      url: initialUrl,
      title: initialUrl,
      favicon: null,
      canGoBack: false,
      canGoForward: false,
      isLoading: false
    }

    this._stateSubject = new BehaviorSubject<TabState>(this._state)

    this._view = this.createWebContentsView()

    this.setupNewWindowHandler()
    this.setupStateListeners()

    // Load initial URL
    this._view.webContents.loadURL(initialUrl)
  }

  get view(): WebContentsView {
    return this._view
  }

  get state(): TabState {
    return { ...this._state }
  }

  get state$(): Observable<TabState> {
    return this._stateSubject.asObservable()
  }

  // PRIVATE HELPERS ---------------------------------------------------------

  private getPartitionString(): string {
    if (this.dataOptions.usePrivateSession) {
      return ''
    }
    return `persist:${this.dataOptions.dataFolderName}`
  }

  private createWebContentsView(): WebContentsView {
    const partition = this.getPartitionString()

    const view = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        devTools: process.env.NODE_ENV === 'development',
        enablePreferredSizeMode: true,
        partition
      }
    })

    view.webContents.on('did-finish-load', () => {
      view.webContents.executeJavaScript('window').then((window) => {
        console.log('window', window.document.body.innerHTML)
      })
    })

    // Transparent background so it blends with the window
    view.setBackgroundColor('#00000000')

    // Context menu for inspecting elements during development
    if (process.env.NODE_ENV === 'development') {
      view.webContents.on('context-menu', (_event, params) => {
        view.webContents.inspectElement(params.x, params.y)
      })
    }

    return view
  }

  private setupStateListeners() {
    const wc = this._view.webContents

    wc.on('page-title-updated', (_event, title) => {
      this._state.title = title
      this.emitState()
    })

    // Electron "page-favicon-updated" gives array of urls strings
    wc.on('page-favicon-updated', (_event, favicons: string[]) => {
      if (favicons && favicons.length > 0) {
        this._state.favicon = favicons[0]
        this.emitState()
      }
    })

    wc.on('did-start-loading', () => {
      this._state.isLoading = true
      this.emitState()
    })

    wc.on('did-stop-loading', () => {
      this._state.isLoading = false
      // Update navigation availability when load stops
      this.updateNavigationState()
      this.emitState()
    })

    wc.on('did-navigate', (_event, url) => {
      this._state.url = url
      this.updateNavigationState()
      this.emitState()
    })
  }

  private updateNavigationState() {
    const history = this._view.webContents.navigationHistory
    this._state.canGoBack = history.canGoBack()
    this._state.canGoForward = history.canGoForward()
  }

  private setupNewWindowHandler() {
    const wc = this._view.webContents

    wc.setWindowOpenHandler(({ url, frameName, features }) => {
      console.log('New window requested:', { url, frameName, features })

      const currentOrigin = this._state.url ? new URL(this._state.url).origin : null
      const newOrigin = new URL(url).origin

      if (this.newWindowOptions.allowSameOrigin && currentOrigin === newOrigin) {
        if (this.newWindowOptions.navigateInCurrentView) {
          wc.loadURL(url)
          return { action: 'deny' }
        } else {
          shell.openExternal(url)
          return { action: 'deny' }
        }
      } else if (this.newWindowOptions.allowExternal) {
        shell.openExternal(url)
        return { action: 'deny' }
      }

      console.log('Blocked new window request for:', url)
      return { action: 'deny' }
    })
  }

  private emitState() {
    this.emit('state-changed', this.state)
    this._stateSubject.next(this.state)
  }

  // PUBLIC API --------------------------------------------------------------

  reload() {
    this._view.webContents.reload()
  }

  goBack() {
    if (this._view.webContents.navigationHistory.canGoBack()) {
      this._view.webContents.goBack()
    }
  }

  goForward() {
    if (this._view.webContents.navigationHistory.canGoForward()) {
      this._view.webContents.goForward()
    }
  }

  destroy() {
    this._view.webContents.close()
  }

  navigate(url: string) {
    this._view.webContents.loadURL(url)
  }
}
