import { WebContentsView, shell } from 'electron'
import windowManager from '../window/manager'
import { WindowType } from '../window/window'

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

class BrowserViewManager {
  private _webContentsView: WebContentsView | null = null
  private isViewCreated = false
  private newWindowOptions: NewWindowHandlerOptions = {
    allowSameOrigin: true,
    allowExternal: true,
    navigateInCurrentView: false
  }

  get webContentsView(): WebContentsView | null {
    return this._webContentsView
  }

  createBrowserView() {
    if (!this.isViewCreated) {
      this._webContentsView = new WebContentsView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          // Enable DevTools in development
          devTools: process.env.NODE_ENV === 'development'
        }
      })

      // Set transparent background
      this._webContentsView.setBackgroundColor('#00000000') // Transparent

      // Setup new window handler
      this.setupNewWindowHandler()

      // Enable context menu for DevTools in development
      if (process.env.NODE_ENV === 'development') {
        this.setupDevToolsContextMenu()
      }

      // Load a default URL or blank page
      this._webContentsView.webContents.loadURL('https://www.google.com')

      // Inject CSS for border radius and styling after page loads
      this._webContentsView.webContents.once('dom-ready', () => {
        this.injectBorderRadiusCSS()
      })

      this.isViewCreated = true
    }
  }

  private setupDevToolsContextMenu() {
    if (!this._webContentsView) return

    // Simple right-click handler for DevTools
    this._webContentsView.webContents.on('context-menu', (event, params) => {
      if (process.env.NODE_ENV === 'development') {
        // Open DevTools with inspect element at the clicked position
        this._webContentsView?.webContents.inspectElement(params.x, params.y)
      }
    })
  }

  private setupNewWindowHandler() {
    if (!this._webContentsView) return

    // Handle new window requests
    this._webContentsView.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
      console.log('New window requested:', { url, frameName, features })

      // Get current URL for origin comparison
      const currentUrl = this._webContentsView?.webContents.getURL()
      const currentOrigin = currentUrl ? new URL(currentUrl).origin : null
      const newOrigin = new URL(url).origin

      // Decide how to handle the new window
      if (this.newWindowOptions.allowSameOrigin && currentOrigin === newOrigin) {
        if (this.newWindowOptions.navigateInCurrentView) {
          // Navigate current view to new URL
          this._webContentsView?.webContents.loadURL(url)
          return { action: 'deny' }
        } else {
          // Open in external browser
          shell.openExternal(url)
          return { action: 'deny' }
        }
      } else if (this.newWindowOptions.allowExternal) {
        // Open external URLs in system browser
        shell.openExternal(url)
        return { action: 'deny' }
      } else {
        // Block the request
        console.log('Blocked new window request for:', url)
        return { action: 'deny' }
      }
    })

    // Handle navigation requests (for links within the same view)
    this._webContentsView.webContents.on('will-navigate', (event, navigationUrl) => {
      console.log('Navigation requested:', navigationUrl)

      // You can add custom navigation logic here
      // For now, allow all navigation within the same view
    })
  }

  private injectBorderRadiusCSS() {
    if (this._webContentsView) {
      const css = `
        html, body {
          border-top-left-radius: 24px !important;
          overflow: hidden !important;
          background: transparent !important;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-top-left-radius: 24px;
          background: inherit;
          z-index: -1;
          pointer-events: none;
        }
        
        /* Ensure the main content area respects the border radius */
        body > * {
          border-top-left-radius: 24px;
          overflow: hidden;
        }
      `

      this._webContentsView.webContents.insertCSS(css)
    }
  }

  showBrowserView(bounds?: BrowserViewBounds) {
    // Create WebContentsView only on first access
    if (!this.isViewCreated) {
      this.createBrowserView()
    }

    // Show the view if it exists and is hidden
    if (this._webContentsView) {
      const mainWindow = windowManager.getWindowByType(WindowType.CoreNode)
      if (mainWindow && !mainWindow.contentView.children.includes(this._webContentsView)) {
        mainWindow.contentView.addChildView(this._webContentsView)

        this._webContentsView.webContents.loadURL('https://www.google.com')

        if (bounds) {
          this._webContentsView.setBounds(bounds)
        } else {
          const windowBounds = mainWindow.getBounds()
          this._webContentsView.setBounds({
            x: 0,
            y: 0,
            width: windowBounds.width,
            height: windowBounds.height
          })
        }
      }
    }
  }

  hideBrowserView() {
    if (this._webContentsView) {
      const mainWindow = windowManager.getWindowByType(WindowType.CoreNode)
      if (mainWindow && mainWindow.contentView.children.includes(this._webContentsView)) {
        mainWindow.contentView.removeChildView(this._webContentsView)
      }
    }
  }

  destroyBrowserView() {
    if (this._webContentsView) {
      this.hideBrowserView()
      this._webContentsView.webContents.close()
      this._webContentsView = null
      this.isViewCreated = false
    }
  }

  // Check if webContentsView exists and is ready
  get isWebContentsReady(): boolean {
    return this._webContentsView !== null && this.isViewCreated
  }

  isCreated() {
    return this.isViewCreated
  }

  // Method to update CSS styling if needed
  updateBorderRadius(topLeft: number = 24) {
    if (this._webContentsView) {
      const css = `
        html, body {
          border-top-left-radius: ${topLeft}px !important;
        }
        
        body::before {
          border-top-left-radius: ${topLeft}px;
        }
        
        body > * {
          border-top-left-radius: ${topLeft}px;
        }
      `

      this._webContentsView.webContents.insertCSS(css)
    }
  }

  // Configure new window behavior
  setNewWindowOptions(options: Partial<NewWindowHandlerOptions>) {
    this.newWindowOptions = { ...this.newWindowOptions, ...options }
  }
}

const browserViewManager = new BrowserViewManager()

export default browserViewManager
export type { BrowserViewBounds, NewWindowHandlerOptions }
