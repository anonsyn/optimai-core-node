import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import 'dotenv/config'
import { app, nativeTheme } from 'electron'
import log from './configs/logger'
import authIpcHandler from './ipc/auth'
import crawl4AiIpcHandler from './ipc/crawl4ai'
import dockerIpcHandler from './ipc/docker'
import nodeIpcHandler from './ipc/node'
import updaterIpcHandler from './ipc/updater'
import windowIpcHandler from './ipc/window'
import { setupApplicationMenu } from './menu'
import { getErrorMessage } from './utils/get-error-message'
import { isMac } from './utils/os'
import { createWindow } from './window/factory'
import windowManager from './window/manager'
import { WindowType } from './window/window'
import { eventsService } from './services/events-service'

const reportFatalError = (type: 'uncaught_exception' | 'unhandled_rejection', error: unknown) => {
  const message =
    type === 'uncaught_exception' ? 'Uncaught exception in main process' : 'Unhandled promise rejection'
  void eventsService.reportError({
    type: `app.${type}`,
    message,
    severity: 'critical',
    error,
    metadata: {
      pid: process.pid
    }
  })
}

process.on('uncaughtException', (error) => {
  log.error('[app] Uncaught exception:', getErrorMessage(error, 'Unknown error'))
  reportFatalError('uncaught_exception', error)
})

process.on('unhandledRejection', (reason) => {
  log.error('[app] Unhandled rejection:', getErrorMessage(reason, 'Unknown rejection'))
  reportFatalError('unhandled_rejection', reason)
})

const gotTheLock = app.requestSingleInstanceLock()

const DEFAULT_WINDOW = WindowType.CoreNode

const logFolder = app.getPath('logs')

console.log('logFolder', logFolder)
console.log('app.getPath("userData")', app.getPath('userData'))

if (!gotTheLock) {
  app.quit()
} else {
  // let tray: Tray | null = null

  // function createTray() {
  //   if (is.dev) {
  //     return null
  //   }

  //   const trayIcon = nativeImage.createFromPath(icon)
  //   tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  //   const showApp = () => {
  //     const mainWindow = windowManager.getVisibleWindow()
  //     if (mainWindow) {
  //       mainWindow.show()
  //       if (isMac) {
  //         app.dock?.show()
  //       }
  //     }
  //   }

  //   const contextMenu = Menu.buildFromTemplate([
  //     {
  //       label: 'Show App',
  //       click: showApp
  //     },
  //     {
  //       label: 'Quit',
  //       click: () => {
  //         app.quit()
  //       }
  //     }
  //   ])

  //   tray.setToolTip('OptimAI Core Node')
  //   tray.setContextMenu(contextMenu)

  //   return tray
  // }

  app.on('second-instance', () => {
    const window = windowManager.getVisibleWindow()
    if (window) {
      if (window.isMinimized()) {
        window.restore()
      }
      window.focus()
      window.show()
      if (isMac) {
        app.dock?.show()
      }
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Set app name for menu
    app.name = 'OptimAI Core Node'

    // Setup application menu
    setupApplicationMenu()

    windowIpcHandler.initialize()
    updaterIpcHandler.initialize()
    authIpcHandler.initialize() // Initialize auth IPC handler for token management
    dockerIpcHandler.initialize() // Initialize generic Docker IPC handler
    crawl4AiIpcHandler.initialize() // Initialize Crawl4AI-specific IPC handler
    nodeIpcHandler.initialize() // Initialize node IPC handler which starts the API server

    const window = createWindow(DEFAULT_WINDOW)
    nativeTheme.themeSource = 'dark'
    windowManager.addWindow(window)

    if (is.dev) {
      window.webContents.openDevTools({ mode: 'undocked' })
    }

    // if (!tray || tray.isDestroyed()) {
    //   tray = createTray()
    // }

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      const window = windowManager.getVisibleWindow()
      if (window) {
        window.show()
        if (isMac) {
          app.dock?.show()
        }
      } else {
        const window = createWindow(DEFAULT_WINDOW)
        windowManager.addWindow(window)
      }
    })

    app.on('before-quit', async () => {
      try {
        windowManager.destroyAllWindows()
        // tray?.destroy()
        await nodeIpcHandler.cleanup()
      } catch (error) {
        console.error('destroy error', getErrorMessage(error, 'destroy error'))
      }
    })
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    app.quit()
  })
}
