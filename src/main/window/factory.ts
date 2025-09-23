import { is } from '@electron-toolkit/utils'
import { BrowserWindowConstructorOptions, screen, shell } from 'electron'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import OptimaiBrowserWindow, { WindowType } from './window'

export const createWindow = (windowType: WindowType) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  // Traffic light positioning constants
  const HEADER_HEIGHT = 40
  const TRAFFIC_LIGHT_HEIGHT = 12
  const TRAFFIC_LIGHT_LEFT_MARGIN = 16
  const TRAFFIC_LIGHT_Y = (HEADER_HEIGHT - TRAFFIC_LIGHT_HEIGHT) / 2

  const windowOptions: Record<WindowType, Partial<BrowserWindowConstructorOptions>> = {
    [WindowType.CoreNode]: {
      width: Math.min(screenWidth, 1200),
      height: Math.min(screenHeight, 800)
    }
  }

  // Create the browser window.
  const window = new OptimaiBrowserWindow({
    windowType,
    show: false,
    frame: false,
    transparent: true,
    width: Math.min(screenWidth, 1200),
    height: Math.min(screenHeight, 800),
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: TRAFFIC_LIGHT_LEFT_MARGIN, y: TRAFFIC_LIGHT_Y },
    autoHideMenuBar: true,
    center: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    ...windowOptions[windowType],
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.on('ready-to-show', () => {
    window.center()
    window.show()
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = process.env['ELECTRON_RENDERER_URL'] + '/core-node.html'
    window.loadURL(url)
  } else {
    const url = join(__dirname, '../renderer/core-node.html')
    window.loadFile(url)
  }

  return window
}
