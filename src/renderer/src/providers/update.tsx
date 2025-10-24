import { useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { getOS, OS } from '@/utils/os'
import type { UpdateInfo } from 'electron-updater'
import { ReactNode, useEffect, useRef } from 'react'

interface UpdateProviderProps {
  children: ReactNode
}

/**
 * UpdateProvider handles automatic update checking and notifications
 * It checks for updates every minute and shows a modal when an update is ready
 */
export function UpdateProvider({ children }: UpdateProviderProps) {
  const openUpdateModal = useOpenModal(Modals.UPDATE_READY)
  const openWindowsUpdateModal = useOpenModal(Modals.WINDOWS_UPDATE_AVAILABLE)
  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const updateStateListenerRef = useRef<(() => void) | null>(null)
  const hasShownModalRef = useRef(false)
  const lastUpdateInfoRef = useRef<UpdateInfo | null>(null)
  const isWindows = getOS() === OS.WINDOWS

  useEffect(() => {
    // Clean up existing listeners
    if (updateStateListenerRef.current) {
      updateStateListenerRef.current()
      updateStateListenerRef.current = null
    }
    if (updateCheckIntervalRef.current) {
      clearInterval(updateCheckIntervalRef.current)
      updateCheckIntervalRef.current = null
    }

    // Reset flags
    hasShownModalRef.current = false
    lastUpdateInfoRef.current = null

    // Setup update state listener
    const setupUpdateListener = () => {
      const { unsubscribe } = window.updaterIPC.onStateChange((state) => {
        console.log('[UpdateProvider] Update state changed:', state)

        // Handle update downloaded state
        if (state.status === 'downloaded' && state.updateInfo) {
          // Only show modal once per update
          if (
            !hasShownModalRef.current ||
            lastUpdateInfoRef.current?.version !== state.updateInfo.version
          ) {
            hasShownModalRef.current = true
            lastUpdateInfoRef.current = state.updateInfo

            console.log('[UpdateProvider] Update downloaded, showing modal')

            const updateData = {
              version: state.updateInfo.version,
              releaseNotes:
                typeof state.updateInfo.releaseNotes === 'string'
                  ? state.updateInfo.releaseNotes
                  : undefined
            }

            // For Windows: Show download modal (no auto-update due to missing code signing)
            // For macOS/Linux: Show auto-install modal
            if (isWindows) {
              openWindowsUpdateModal(updateData)
            } else {
              openUpdateModal(updateData)
            }
          }
        }

        // Reset flag if update check failed or went back to idle
        if (state.status === 'idle' || state.status === 'error') {
          // Keep the hasShownModalRef state if we already showed the modal
          // This prevents re-showing the modal if the update check runs again
        }
      })

      updateStateListenerRef.current = unsubscribe
    }

    // Setup periodic update checking
    const checkForUpdates = () => {
      console.log('[UpdateProvider] Checking for updates...')
      window.updaterIPC.checkForUpdateAndNotify()
    }

    // Setup listener first
    setupUpdateListener()

    // Initial check after a short delay (to let the app fully load)
    setTimeout(() => {
      checkForUpdates()
    }, 10000) // Check after 10 seconds

    // Setup interval to check every minute
    updateCheckIntervalRef.current = setInterval(() => {
      // Only check if we haven't shown the modal yet
      // This prevents unnecessary checks after an update is ready
      if (!hasShownModalRef.current) {
        checkForUpdates()
      }
    }, 60000) // Check every 60 seconds

    // Cleanup on unmount
    return () => {
      if (updateStateListenerRef.current) {
        updateStateListenerRef.current()
        updateStateListenerRef.current = null
      }
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current)
        updateCheckIntervalRef.current = null
      }
    }
  }, [openUpdateModal, openWindowsUpdateModal, isWindows])

  return <>{children}</>
}

export default UpdateProvider
