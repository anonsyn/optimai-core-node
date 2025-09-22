import { useCloseModal, useOpenModal } from '@/hooks/modal'
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
  useRef,
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
  CHECKING_DOCKER = 'checking_docker',
  INITIALIZING_CRAWLER = 'initializing_crawler',
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

  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery({
    enabled: false,
    retry: false
  })

  const openLoginModal = useOpenModal(Modals.LOGIN)
  const openDockerNotInstalledModal = useOpenModal(Modals.DOCKER_NOT_INSTALLED)
  const openDockerNotRunningModal = useOpenModal(Modals.DOCKER_NOT_RUNNING)
  const closeDockerNotInstalledModal = useCloseModal(Modals.DOCKER_NOT_INSTALLED)
  const closeDockerNotRunningModal = useCloseModal(Modals.DOCKER_NOT_RUNNING)
  const isStartingRef = useRef(false)

  // Add a status message
  const addStatus = useCallback((message: string, isError = false) => {
    setStatuses((prev) => [...prev, { message, error: isError }])
  }, [])

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPhase(StartupPhase.CHECKING_UPDATES)
      addStatus('Looking for new updates...')

      const { unsubscribe } = window.updaterIPC.onStateChange((state) => {
        if (state.status === 'downloading') {
          addStatus('Downloading the latest version...')
          return
        }

        if (state.status === 'idle' || state.status === 'error') {
          unsubscribe()
          resolve(false)
          return
        }

        if (state.status === 'downloaded') {
          addStatus('Installing update and restarting...')
          unsubscribe()
          resolve(true)
          return
        }
      })

      window.updaterIPC.checkForUpdateAndNotify()
    })
  }, [addStatus])

  // Check Docker requirements
  const checkDockerRequirements = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.CHECKING_DOCKER)
    addStatus('Checking Docker requirements...')

    const waitForRetry = async (type: 'installed' | 'running') => {
      await new Promise<void>((resolve) => {
        let resolved = false
        const openModal =
          type === 'installed' ? openDockerNotInstalledModal : openDockerNotRunningModal
        const closeModal =
          type === 'installed' ? closeDockerNotInstalledModal : closeDockerNotRunningModal

        openModal({
          onRetry: async () => {
            addStatus('Rechecking Docker requirements...')

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

                addStatus('Docker Desktop is still not installed', true)
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

              addStatus('Docker Desktop is still not running', true)
              return false
            } catch (retryError) {
              console.error('Docker retry check failed:', retryError)
              addStatus('Docker check failed', true)
              setError('Failed to check Docker status')
              return false
            }
          }
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
          addStatus('Docker Desktop is not installed', true)
          hasRetried = true
          await waitForRetry('installed')
          continue
        }

        const dockerRunning = await window.dockerIPC.checkRunning()
        if (!dockerRunning) {
          addStatus('Docker Desktop is not running', true)
          hasRetried = true
          await waitForRetry('running')
          continue
        }

        addStatus('Docker requirements satisfied')
        return true
      }
    } catch (error) {
      console.error('Docker check failed:', error)
      addStatus('Docker check failed', true)
      setError('Failed to check Docker status')
      return false
    }
  }, [
    addStatus,
    closeDockerNotInstalledModal,
    closeDockerNotRunningModal,
    openDockerNotInstalledModal,
    openDockerNotRunningModal,
    setError
  ])

  // Initialize Crawl4AI service
  const initializeCrawler = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.INITIALIZING_CRAWLER)
    addStatus('Initializing crawler service...')

    try {
      // Listen for initialization progress
      const unsubscribe = window.crawl4AiIPC.onInitProgress((progress) => {
        if (progress.status === 'checking') {
          addStatus('Checking crawler requirements...')
        } else if (progress.status === 'pulling') {
          addStatus('Downloading crawler image...')
        } else if (progress.status === 'ready') {
          addStatus('Crawler service is ready')
        } else if (progress.status === 'error') {
          addStatus(`Crawler initialization failed: ${progress.error}`, true)
        }
      })

      const success = await window.crawl4AiIPC.initialize()
      unsubscribe()

      if (success) {
        addStatus('Crawler service initialized successfully')
        return true
      } else {
        addStatus('Failed to initialize crawler service', true)
        setError('Crawler service initialization failed')
        return false
      }
    } catch (error) {
      console.error('Crawler initialization failed:', error)
      addStatus('Crawler initialization failed', true)
      setError('Failed to initialize crawler service')
      return false
    }
  }, [addStatus])

  // Check authentication
  const checkAuth = useCallback(async (): Promise<boolean> => {
    setPhase(StartupPhase.CHECKING_AUTH)
    addStatus('Checking authentication...')

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
      addStatus('Authentication successful')
      return true
    } catch (err) {
      console.error('Authentication check failed:', err)
      addStatus('Please sign in to continue')
      return false
    }
  }, [addStatus, dispatch, refetchCurrentUser])

  // Start the node
  const startNode = useCallback(async (): Promise<boolean> => {
    try {
      setPhase(StartupPhase.STARTING_NODE)
      addStatus('Starting Node...')

      const success = await window.nodeIPC.startNode()

      if (!success) {
        throw new Error('Node start returned false')
      }

      // Wait a bit for the node to fully initialize
      await sleep(1000)

      // Check node status to confirm it's running
      const nodeStatus = await window.nodeIPC.getStatus()

      if (nodeStatus?.running) {
        addStatus('Node started successfully')
        setPhase(StartupPhase.COMPLETED)
        return true
      } else {
        throw new Error(`Node status: ${nodeStatus?.status || 'unknown'}`)
      }
    } catch (err) {
      console.error('Error starting node:', err)
      addStatus('Starting node failed, please restart the application', true)
      setError('Failed to start node')
      setPhase(StartupPhase.ERROR)
      return false
    }
  }, [addStatus])

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
      const shouldRestart = await checkForUpdates()
      await sleep(1000)

      if (shouldRestart) {
        window.updaterIPC.quitAndInstall()
        return
      }

      // 2. Check Docker requirements
      const dockerReady = await checkDockerRequirements()
      if (!dockerReady) {
        setPhase(StartupPhase.ERROR)
        return
      }

      // 3. Initialize Crawl4AI service
      const crawlerReady = await initializeCrawler()
      if (!crawlerReady) {
        setPhase(StartupPhase.ERROR)
        return
      }

      // 4. Check authentication
      const isAuthenticated = await checkAuth()

      if (!isAuthenticated) {
        // Show login modal
        openLoginModal({
          onSuccess: async () => {
            // After successful login, continue with node startup
            const success = await startNode()
            if (success) {
              navigate(PATHS.DATA_MINING)
            }
          }
        })
        return
      }

      // 5. Start node
      const nodeStarted = await startNode()

      if (nodeStarted) {
        // Navigate to data mining page after a short delay
        await sleep(500)
        navigate(PATHS.DATA_MINING)
      }
    } catch (err) {
      console.error('Startup error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setPhase(StartupPhase.ERROR)
      addStatus('Startup failed', true)
    } finally {
      setIsLoading(false)
      isStartingRef.current = false
    }
  }, [
    checkForUpdates,
    checkDockerRequirements,
    initializeCrawler,
    checkAuth,
    startNode,
    openLoginModal,
    navigate,
    addStatus
  ])

  // Retry functionality
  const retry = useCallback(() => {
    setStatuses([{ message: 'Retrying...' }])
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
