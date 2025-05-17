import type { ProgressInfo, UpdateInfo } from 'electron-updater'

type UpdaterStatus = 'initializing' | 'idle' | 'checking' | 'downloading' | 'downloaded' | 'error'

interface UpdateState {
  status: UpdaterStatus
  updateInfo?: UpdateInfo
  progressInfo?: ProgressInfo
  error?: any
}

export { type UpdaterStatus, type UpdateState }
