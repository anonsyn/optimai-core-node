import { is } from '@electron-toolkit/utils'
import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { BehaviorSubject } from 'rxjs'
import logger from '../../configs/logger'
import windowManager from '../../window/manager'
import { WindowName } from '../../window/window'
import { UpdaterEvents } from './events'
import { UpdateState } from './types'

class UpdaterIpcHandler {
  initialize() {
    const state = new BehaviorSubject<UpdateState>({
      status: 'initializing'
    })

    autoUpdater.disableWebInstaller = false
    autoUpdater.allowDowngrade = false
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.setFeedURL(process.env['VITE_FEED_URL'] || 'https://core-node.optimai.network')

    autoUpdater.on('checking-for-update', function () {
      logger.info('Checking for update')
      state.next({
        status: 'checking'
      })
    })

    autoUpdater.on('update-not-available', () => {
      logger.info('Update not available')
      state.next({
        status: 'idle'
      })
    })

    autoUpdater.on('update-downloaded', (updateInfo) => {
      logger.info('Update downloaded')
      state.next({
        status: 'downloaded',
        updateInfo
      })
    })

    autoUpdater.on('download-progress', (progressInfo) => {
      logger.info('Downloading update')
      state.next({
        status: 'downloading',
        progressInfo
      })
    })

    autoUpdater.on('error', (error) => {
      logger.error('Error downloading update')
      logger.error(error)
      state.next({
        status: 'error',
        error
      })
    })

    if (is.dev) {
      setTimeout(() => {
        state.next({
          status: 'idle'
        })
      }, 1000)
    }

    state.subscribe((state) => {
      const window = windowManager.getWindowByName(WindowName.Main)
      if (window) {
        window.webContents.send(UpdaterEvents.OnStateChange, state)
      }
    })

    ipcMain.on(UpdaterEvents.CheckForUpdateAndNotify, () => {
      autoUpdater.checkForUpdatesAndNotify()
    })
    ipcMain.on(UpdaterEvents.StartUpdate, () => {
      autoUpdater.downloadUpdate()
    })
    ipcMain.on(UpdaterEvents.QuitAndInstall, () => {
      autoUpdater.quitAndInstall()
    })
  }
}

const updaterIpcHandler = new UpdaterIpcHandler()

export default updaterIpcHandler
