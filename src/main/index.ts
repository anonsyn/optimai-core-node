import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, Menu, nativeImage, Tray } from 'electron'
import log from 'electron-log/main'
import icon from '../../resources/icon.png?asset'
import authIpcHandler from './ipc/auth'
import nodeIpcHandler from './ipc/node'
import updaterIpcHandler from './ipc/updater'
import windowIpcHandler from './ipc/window'
import { nodeServer } from './node/server'
import { createWindow } from './window/factory'
import windowManager from './window/manager'
import { WindowType } from './window/window'

const gotTheLock = app.requestSingleInstanceLock()

const DEFAULT_WINDOW = WindowType.LiteNode

const logFolder = app.getPath('logs')
log.info(logFolder)

if (!gotTheLock) {
  app.quit()
} else {
  let tray: Tray | null = null

  function createTray() {
    if (is.dev) {
      return null
    }

    const trayIcon = nativeImage.createFromPath(icon)
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

    const showApp = () => {
      const mainWindow = windowManager.getVisibleWindow()
      if (mainWindow) {
        mainWindow.show()
      }
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: showApp
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])

    tray.setToolTip('OptimAI Core Node')
    tray.setContextMenu(contextMenu)

    return tray
  }

  app.on('second-instance', () => {
    const window = windowManager.getVisibleWindow()
    if (window) {
      if (window.isMinimized()) {
        window.restore()
      }
      window.focus()
      window.show()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    windowIpcHandler.initialize()
    updaterIpcHandler.initialize()
    authIpcHandler.initialize()
    nodeIpcHandler.initialize()

    const window = createWindow(WindowType.LiteNode)
    windowManager.addWindow(window)

    if (is.dev) {
      window.webContents.openDevTools({ mode: 'undocked' })
    }

    if (!tray || tray.isDestroyed()) {
      tray = createTray()
    }

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
      } else {
        const window = createWindow(DEFAULT_WINDOW)
        windowManager.addWindow(window)
      }
    })

    app.on('before-quit', async () => {
      try {
        windowManager.destroyAllWindows()
        tray?.destroy()
        await nodeServer.stop()
      } catch (error) {
        console.error('destroy error', error)
      }
    })
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
