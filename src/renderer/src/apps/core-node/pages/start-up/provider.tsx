import { useCloseModal, useOpenModal } from '@/hooks/modal'
import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { authActions } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
import { getErrorMessage } from '@/utils/get-error-message'
import { getOS, OS } from '@/utils/os'
import { sessionManager } from '@/utils/session-manager'
import { sleep } from '@/utils/sleep'
import { PATHS } from '@core-node/routers/paths'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useNavigate } from 'react-router'

// Types
// Removed StatusMessage and status tracking per request

export enum StartupPhase {
  INITIALIZING = 'initializing',
  CHECKING_UPDATES = 'checking_updates',
  CHECKING_DOCKER = 'checking_docker',
  CHECKING_AUTH = 'checking_auth',
  STARTING_NODE = 'starting_node',
  COMPLETED = 'completed',
  ERROR = 'error'
}

interface StartupContextValue {
  // State
  phase: StartupPhase
  isLoading: boolean
  error: string | null

  // Actions
  retry: () => void

  // Computed
  canRetry: boolean
}

const StartupContext = createContext<StartupContextValue | undefined>(undefined)

interface StartupProviderProps {
  children: ReactNode
}

export const StartupProvider = ({ children }: StartupProviderProps) => {
  const [phase, setPhase] = useState<StartupPhase>(StartupPhase.INITIALIZING)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery({
    enabled: false,
    retry: false
  })

  const openLoginModal = useOpenModal(Modals.LOGIN)
  const openWindowsUpdateModal = useOpenModal(Modals.WINDOWS_UPDATE_AVAILABLE)
  const openDockerNotInstalledModal = useOpenModal(Modals.DOCKER_NOT_INSTALLED)
  const openDockerNotRunningModal = useOpenModal(Modals.DOCKER_NOT_RUNNING)
  const closeDockerNotInstalledModal = useCloseModal(Modals.DOCKER_NOT_INSTALLED)
  const closeDockerNotRunningModal = useCloseModal(Modals.DOCKER_NOT_RUNNING)
  const isStartingRef = useRef(false)
  const isWindows = getOS() === OS.WINDOWS

  // Status messages removed; rely on phase and error only

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPhase(StartupPhase.CHECKING_UPDATES)
      // Small delay to ensure phase transition is visible
      // UI status feed removed; keep phase transitions only
      let resolved = false

      const { unsubscribe } = window.updaterIPC.onStateChange((state) => {
        if (resolved) return

        if (state.status === 'downloading') {
          return
        }

        if (state.status === 'idle' || state.status === 'error') {
          if (!resolved) {
            resolved = true
            unsubscribe()
            resolve(false)
          }
          return
        }

        if (state.status === 'downloaded') {
          if (!resolved) {
            resolved = true
            unsubscribe()

            // For Windows: Show download modal and don't restart
            // For macOS/Linux: Allow restart with auto-install
            if (isWindows && state.updateInfo) {
              openWindowsUpdateModal({
                version: state.updateInfo.version,
                releaseNotes:
                  typeof state.updateInfo.releaseNotes === 'string'
                    ? state.updateInfo.releaseNotes
                    : undefined
              })
              // resolve(false) // Don't restart on Windows
            } else {
              resolve(true) // Restart on macOS/Linux
            }
          }
          return
        }
      })

      window.updaterIPC.checkForUpdateAndNotify()
    })
  }, [isWindows, openWindowsUpdateModal])

  // Check Docker requirements
  const checkDockerRequirements = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.CHECKING_DOCKER)
    // Small delay to ensure phase transition is visible
    await sleep(100)
    // status feed removed

    const waitForRetry = async (type: 'installed' | 'running') => {
      await new Promise<void>((resolve) => {
        let resolved = false
        const openModal =
          type === 'installed' ? openDockerNotInstalledModal : openDockerNotRunningModal
        const closeModal =
          type === 'installed' ? closeDockerNotInstalledModal : closeDockerNotRunningModal

        openModal({
          onRetry: async () => {
            // status feed removed

            try {
              if (type === 'installed') {
                const dockerInstalled = await window.dockerIPC.checkInstalled()
                if (dockerInstalled) {
                  if (!resolved) {
                    resolved = true
                    closeModal()
                    resolve()
                  }
                  return true
                }

                // status feed removed
                return false
              }

              const dockerRunning = await window.dockerIPC.checkRunning()
              if (dockerRunning) {
                if (!resolved) {
                  resolved = true
                  closeModal()
                  resolve()
                }
                return true
              }

              // status feed removed
              return false
            } catch (retryError) {
              console.error('Docker retry check failed:', retryError)
              setError("We couldn't check Docker")
              return false
            }
          },
          autoCheck: true,
          canDismiss: false
        })
      })
    }

    try {
      let hasRetried = false

      while (true) {
        if (hasRetried) {
          // Allow a brief pause so the status list visibly updates before rechecking
          await sleep(300)
        }

        const dockerInstalled = await window.dockerIPC.checkInstalled()
        if (!dockerInstalled) {
          hasRetried = true
          await waitForRetry('installed')
          continue
        }

        const dockerRunning = await window.dockerIPC.checkRunning()
        if (!dockerRunning) {
          hasRetried = true
          await waitForRetry('running')
          continue
        }

        return true
      }
    } catch (error) {
      console.error('Docker check failed:', error)
      setError('We couldn’t check Docker')
      setPhase(StartupPhase.ERROR)
      return false
    }
  }, [
    closeDockerNotInstalledModal,
    closeDockerNotRunningModal,
    openDockerNotInstalledModal,
    openDockerNotRunningModal,
    setError
  ])

  // Check authentication
  const checkAuth = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.CHECKING_AUTH)
    // Small delay to ensure phase transition is visible
    await sleep(100)
    // status feed removed

    try {
      const accessToken = await sessionManager.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token found')
      }

      const res = await refetchCurrentUser({
        throwOnError: true
      })

      const user = res.data?.user
      console.log({ user })

      if (!user) {
        throw new Error('No user found')
      }

      dispatch(authActions.setUser(user))
      return true
    } catch (err) {
      console.error('Authentication check failed:', err)
      return false
    }
  }, [dispatch, refetchCurrentUser])

  // Start the node
  const startNode = useCallback(async (): Promise<boolean> => {
    try {
      setPhase(StartupPhase.STARTING_NODE)
      // Small delay to ensure phase transition is visible
      await sleep(100)

      const success = await window.nodeIPC.startNode()

      if (!success) {
        throw new Error('Node start returned false')
      }

      // Wait a bit for the node to fully initialize
      await sleep(1000)

      // Node start succeeded, mark as completed
      setPhase(StartupPhase.COMPLETED)
      return true
    } catch (err) {
      console.error('Error starting node:', err)
      setError('Couldn’t start OptimAI')
      setPhase(StartupPhase.ERROR)
      return false
    }
  }, [])

  // Minimum delay between phase transitions for smooth animations
  const PHASE_TRANSITION_DELAY = 1500 // 1.5 seconds minimum per phase

  // Main startup sequence
  const startApplication = useCallback(async () => {
    if (isStartingRef.current) {
      return
    }

    isStartingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      // Initial delay for animation
      await sleep(3000)

      // 1. Check for updates
      const updateStartTime = Date.now()
      const shouldRestart = await checkForUpdates()
      const updateElapsed = Date.now() - updateStartTime
      if (updateElapsed < PHASE_TRANSITION_DELAY) {
        await sleep(PHASE_TRANSITION_DELAY - updateElapsed)
      }

      if (shouldRestart) {
        try {
          window.updaterIPC.quitAndInstall()
          return
        } catch (error) {
          console.log(getErrorMessage(error))
        }
      }

      // 2. Check Docker requirements
      const dockerStartTime = Date.now()
      const dockerReady = await checkDockerRequirements()

      if (!dockerReady) {
        return
      }

      const dockerElapsed = Date.now() - dockerStartTime
      if (dockerElapsed < PHASE_TRANSITION_DELAY) {
        await sleep(PHASE_TRANSITION_DELAY - dockerElapsed)
      }

      // 3. Check authentication
      const authStartTime = Date.now()
      const isAuthenticated = await checkAuth()
      const authElapsed = Date.now() - authStartTime
      if (authElapsed < PHASE_TRANSITION_DELAY) {
        await sleep(PHASE_TRANSITION_DELAY - authElapsed)
      }

      if (!isAuthenticated) {
        // Show login modal
        openLoginModal({
          onSuccess: async () => {
            // After successful login, continue with node startup
            const success = await startNode()

            if (success) {
              const nodeStartTime = Date.now()
              const nodeElapsed = Date.now() - nodeStartTime
              if (nodeElapsed < PHASE_TRANSITION_DELAY) {
                await sleep(PHASE_TRANSITION_DELAY - nodeElapsed)
              }

              // Give time for completion animation
              await sleep(2000)
              navigate(PATHS.DATA_MINING)
            }
          }
        })
        return
      }

      // 4. Start node
      const nodeStartTime = Date.now()
      const nodeStarted = await startNode()

      if (nodeStarted) {
        const nodeElapsed = Date.now() - nodeStartTime
        if (nodeElapsed < PHASE_TRANSITION_DELAY) {
          await sleep(PHASE_TRANSITION_DELAY - nodeElapsed)
        }

        // Give time for completion animation before navigating
        await sleep(2000)
        navigate(PATHS.DATA_MINING)
      }
    } catch (err) {
      console.error('Startup error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase(StartupPhase.ERROR)
    } finally {
      setIsLoading(false)
      isStartingRef.current = false
    }
  }, [checkForUpdates, checkDockerRequirements, checkAuth, startNode, openLoginModal, navigate])

  // Retry functionality
  const retry = useCallback(() => {
    setPhase(StartupPhase.INITIALIZING)
    startApplication()
  }, [startApplication])

  // Start the application on mount
  useEffect(() => {
    startApplication()
  }, [startApplication]) // Only run once on mount

  const value = useMemo<StartupContextValue>(
    () => ({
      phase,
      isLoading,
      error,
      retry,
      canRetry: phase === StartupPhase.ERROR
    }),
    [phase, isLoading, error, retry]
  )

  return <StartupContext.Provider value={value}>{children}</StartupContext.Provider>
}

// Hook to use the startup context
export const useStartup = () => {
  const context = useContext(StartupContext)

  if (context === undefined) {
    throw new Error('useStartup must be used within a StartupProvider')
  }

  return context
}

// Export everything needed
export default StartupProvider
