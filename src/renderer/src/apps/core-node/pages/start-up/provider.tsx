import { useOpenModal } from '@/hooks/modal'
import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { authActions } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
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
  useState
} from 'react'
import { useNavigate } from 'react-router'

// Types
export interface StatusMessage {
  message: string
  error?: boolean
}

export enum StartupPhase {
  INITIALIZING = 'initializing',
  CHECKING_UPDATES = 'checking_updates',
  WAITING_SERVER = 'waiting_server',
  CHECKING_AUTH = 'checking_auth',
  STARTING_NODE = 'starting_node',
  COMPLETED = 'completed',
  ERROR = 'error'
}

interface StartupContextValue {
  // State
  phase: StartupPhase
  statuses: StatusMessage[]
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
  const [statuses, setStatuses] = useState<StatusMessage[]>([{ message: 'Getting ready...' }])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const getCurrentUserQuery = useGetCurrentUserQuery({
    enabled: false,
    retry: false
  })

  const openLoginModal = useOpenModal(Modals.LOGIN)

  // Add a status message
  const addStatus = useCallback((message: string, isError = false) => {
    setStatuses((prev) => [...prev, { message, error: isError }])
  }, [])

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPhase(StartupPhase.CHECKING_UPDATES)
      addStatus('Looking for new updates...')

      window.updaterIPC.onStateChange((state) => {
        if (state.status === 'checking') {
          addStatus('Looking for new updates...')
          return
        }

        if (state.status === 'downloading') {
          addStatus('Downloading the latest version...')
          return
        }

        if (state.status === 'idle' || state.status === 'error') {
          resolve(false)
          return
        }

        if (state.status === 'downloaded') {
          addStatus('Installing update and restarting...')
          resolve(true)
          return
        }
      })

      window.updaterIPC.checkForUpdateAndNotify()
    })
  }, [addStatus])

  // Wait for CLI server to be ready
  const waitForServer = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.WAITING_SERVER)
    addStatus('Setting up your workspace...')

    const maxRetries = 30
    const delayMs = 1000

    for (let i = 0; i < maxRetries; i++) {
      try {
        const serverStatus = await window.nodeIPC.getServerStatus()

        if (serverStatus.isReady) {
          addStatus('Server is ready')
          return true
        }

        if (i === 0) {
          addStatus(`Server starting on port ${serverStatus.port || 'auto'}...`)
        }

        await sleep(delayMs)
      } catch (error) {
        console.error('Error checking server status:', error)

        if (i === maxRetries - 1) {
          addStatus('Failed to connect to server', true)
          setError('Server failed to start')
          return false
        }

        await sleep(delayMs)
      }
    }

    addStatus('Server startup timeout', true)
    setError('Server took too long to start')
    return false
  }, [addStatus])

  // Check authentication
  const checkAuth = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.CHECKING_AUTH)
    addStatus('Verifying your account...')

    try {
      const accessToken = await sessionManager.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token found')
      }

      const res = await getCurrentUserQuery.refetch({
        throwOnError: true
      })

      const user = res.data?.user
      console.log({ user })

      if (!user) {
        throw new Error('No user found')
      }

      dispatch(authActions.setUser(user))
      addStatus('Successfully signed in')
      return true
    } catch (err) {
      console.error('Authentication check failed:', err)
      addStatus('Please sign in to continue')
      return false
    }
  }, [addStatus, dispatch, getCurrentUserQuery])

  // Start the node
  const startNode = useCallback(async (): Promise<boolean> => {
    try {
      setPhase(StartupPhase.STARTING_NODE)
      addStatus('Starting your node...')

      const success = await window.nodeIPC.startNode()

      if (!success) {
        throw new Error('Node start returned false')
      }

      // Wait a bit for the node to fully initialize
      await sleep(1000)

      // Check node status to confirm it's running
      const nodeStatus = await window.nodeIPC.getNodeStatus()

      if (nodeStatus?.running) {
        addStatus('Node is running')
        setPhase(StartupPhase.COMPLETED)
        return true
      } else {
        throw new Error(`Node status: ${nodeStatus?.status || 'unknown'}`)
      }
    } catch (err) {
      console.error('Error starting node:', err)
      addStatus('Unable to start your node. Please restart the app.', true)
      setError('Node startup failed')
      setPhase(StartupPhase.ERROR)
      return false
    }
  }, [addStatus])

  // Main startup sequence
  const startApplication = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Initial delay for animation
      await sleep(3000)

      // 1. Check for updates
      const shouldRestart = await checkForUpdates()
      await sleep(1000)

      if (shouldRestart) {
        window.updaterIPC.quitAndInstall()
        return
      }

      // 2. Wait for CLI server to be ready
      const serverReady = await waitForServer()
      if (!serverReady) {
        setPhase(StartupPhase.ERROR)
        setIsLoading(false)
        return
      }

      // 3. Check authentication
      const isAuthenticated = await checkAuth()

      if (!isAuthenticated) {
        // Show login modal
        openLoginModal({
          onSuccess: async () => {
            // After successful login, continue with node startup
            const success = await startNode()
            if (success) {
              navigate(PATHS.BROWSER)
            }
          }
        })
        setIsLoading(false)
        return
      }

      // 4. Start node
      const nodeStarted = await startNode()

      if (nodeStarted) {
        // Navigate to browser after a short delay
        await sleep(500)
        navigate(PATHS.BROWSER)
      }
    } catch (err) {
      console.error('Startup error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setPhase(StartupPhase.ERROR)
      addStatus('Startup failed', true)
    } finally {
      setIsLoading(false)
    }
  }, [checkForUpdates, waitForServer, checkAuth, startNode, openLoginModal, navigate, addStatus])

  // Retry functionality
  const retry = useCallback(() => {
    setStatuses([{ message: 'Retrying...' }])
    setPhase(StartupPhase.INITIALIZING)
    startApplication()
  }, [startApplication])

  // Start the application on mount
  useEffect(() => {
    startApplication()
  }, []) // Only run once on mount

  const value = useMemo<StartupContextValue>(
    () => ({
      phase,
      statuses,
      isLoading,
      error,
      retry,
      canRetry: phase === StartupPhase.ERROR
    }),
    [phase, statuses, isLoading, error, retry]
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
