import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, Menu, nativeImage, screen, shell, Tray } from 'electron'
import debug from 'electron-debug'
import log from 'electron-log/main'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import authIpcHandler from './ipc/auth'
import updaterIpcHandler from './ipc/updater'
import windowIpcHandler from './ipc/window'
import windowManager from './window/manager'
import OptimaiBrowserWindow, { WindowName } from './window/window'
const gotTheLock = app.requestSingleInstanceLock()

const logFolder = app.getPath('logs')
log.info(logFolder)

if (!gotTheLock) {
  app.quit()
} else {
  if (is.dev) {
    debug({
      devToolsMode: 'undocked'
    })
  }
  let tray: Tray | null = null

  const createWindow = () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

    const width = Math.min(screenWidth, 420)
    const height = Math.min(screenHeight, 700)

    // Create the browser window.
    const mainWindow = new OptimaiBrowserWindow({
      name: WindowName.Main,
      width: width,
      height: height,
      show: false,
      frame: false,
      transparent: true,
      maximizable: false,
      roundedCorners: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.center()
      mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return mainWindow
  }

  function createTray() {
    if (is.dev) {
      return null
    }

    const trayIcon = nativeImage.createFromPath(icon)
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

    const showApp = () => {
      const mainWindow = windowManager.getWindowByName(WindowName.Main)
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
    const window = windowManager.getWindowByName(WindowName.Main)
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

    const window = createWindow()
    windowManager.addWindow(window)

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
      const window = windowManager.getWindowByName(WindowName.Main)
      if (window) {
        window.show()
      }
    })

    app.on('before-quit', async () => {
      try {
        windowManager.destroyAllWindows()
        tray?.destroy()
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
