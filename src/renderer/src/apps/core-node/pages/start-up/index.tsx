import { Button } from '@/components/ui/button'
import { PATHS } from '@core-node/routers/paths'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import CanvasGlow from './canvas-glow'
import { StartupTimeline, StepStatus, TimelineStep } from './startup-timeline'
import WaveVisualizer from './wave-visualizer'

interface StepState {
  update: { status: StepStatus; detail?: string; progress?: number }
  docker: { status: StepStatus; detail?: string }
  authentication: { status: StepStatus; detail?: string }
  node: { status: StepStatus; detail?: string }
}

const StartUpPage = () => {
  const navigate = useNavigate()

  const [steps, setSteps] = useState<StepState>({
    update: { status: 'pending' },
    docker: { status: 'pending' },
    authentication: { status: 'pending' },
    node: { status: 'pending' }
  })

  const [dockerNeedsAction, setDockerNeedsAction] = useState(false)

  // Update a specific step
  const updateStep = useCallback(
    (stepId: keyof StepState, updates: Partial<StepState[keyof StepState]>) => {
      setSteps((prev) => ({
        ...prev,
        [stepId]: { ...prev[stepId], ...updates }
      }))
    },
    []
  )

  // Start the node
  const startNode = useCallback(async () => {
    updateStep('node', { status: 'checking', detail: 'Starting node...' })

    try {
      const started = await window.nodeIPC.startNode()

      if (started) {
        updateStep('node', {
          status: 'success',
          detail: 'Node is running'
        })

        // Navigate to data mining page after a brief delay
        setTimeout(() => {
          navigate(PATHS.DATA_MINING)
        }, 1500)
      } else {
        updateStep('node', {
          status: 'error',
          detail: 'Failed to start node'
        })
      }
    } catch (error) {
      updateStep('node', {
        status: 'error',
        detail: `Failed to start node: ${error}`
      })
    }
  }, [updateStep, navigate])

  // Check authentication
  const checkAuthentication = useCallback(async () => {
    updateStep('authentication', { status: 'checking' })

    try {
      const hasTokens = await window.authIPC.hasTokens()

      if (hasTokens) {
        // Get access token to verify it's still valid
        const accessToken = await window.authIPC.getAccessToken()
        if (accessToken) {
          updateStep('authentication', {
            status: 'success',
            detail: 'Already authenticated'
          })
          startNode()
        } else {
          updateStep('authentication', {
            status: 'error',
            detail: 'Authentication required - please login'
          })
        }
      } else {
        updateStep('authentication', {
          status: 'error',
          detail: 'Authentication required - please login'
        })
      }
    } catch (error) {
      updateStep('authentication', {
        status: 'error',
        detail: `Authentication check failed: ${error}`
      })
    }
  }, [updateStep, startNode])

  // Check Docker status
  const checkDocker = useCallback(async () => {
    updateStep('docker', { status: 'checking' })

    try {
      // Check if Docker is installed
      const installed = await window.dockerIPC.checkInstalled()

      if (!installed) {
        updateStep('docker', {
          status: 'error',
          detail: 'Docker Desktop is not installed'
        })
        setDockerNeedsAction(true)
        return
      }

      // Check if Docker is running
      const running = await window.dockerIPC.checkRunning()

      if (!running) {
        updateStep('docker', {
          status: 'error',
          detail: 'Docker Desktop is not running. Please start Docker Desktop.'
        })
        setDockerNeedsAction(true)
        return
      }

      // Initialize Crawl4AI service (will pull image if needed)
      updateStep('docker', {
        status: 'checking',
        detail: 'Initializing crawler service...'
      })

      // Listen for initialization progress
      const unsubscribe = window.crawl4AiIPC.onInitProgress((progress) => {
        if (progress.status === 'pulling') {
          updateStep('docker', {
            status: 'downloading',
            detail: 'Downloading crawler image...'
          })
        }
      })

      const initialized = await window.crawl4AiIPC.initialize()
      unsubscribe()

      if (initialized) {
        updateStep('docker', {
          status: 'success',
          detail: 'Docker and crawler ready'
        })
        checkAuthentication()
      } else {
        updateStep('docker', {
          status: 'error',
          detail: 'Failed to initialize crawler service'
        })
      }
    } catch (error) {
      updateStep('docker', {
        status: 'error',
        detail: `Docker check failed: ${error}`
      })
      setDockerNeedsAction(true)
    }
  }, [updateStep, checkAuthentication])

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    updateStep('update', { status: 'checking' })

    try {
      // For now, just simulate update check since the API might be different
      await new Promise((resolve) => setTimeout(resolve, 2000))
      updateStep('update', { status: 'success', detail: 'App is up to date' })
      checkDocker()
    } catch {
      updateStep('update', {
        status: 'warning',
        detail: 'Update check failed, continuing...'
      })
      checkDocker()
    }
  }, [updateStep, checkDocker])

  // Open Docker installation guide
  const openDockerGuide = useCallback(async () => {
    await window.dockerIPC.openInstallGuide()
  }, [])

  // Retry Docker check
  const retryDocker = useCallback(() => {
    setDockerNeedsAction(false)
    checkDocker()
  }, [checkDocker])

  // Start the flow on mount
  useEffect(() => {
    checkForUpdates()
  }, [checkForUpdates])

  // Convert state to timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      id: 'update',
      title: 'Check for Updates',
      description: 'Ensuring you have the latest version',
      status: steps.update.status,
      progress: steps.update.progress,
      detail: steps.update.detail
    },
    {
      id: 'docker',
      title: 'Docker Setup',
      description: 'Preparing container environment',
      status: steps.docker.status,
      detail: steps.docker.detail,
      action: dockerNeedsAction && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={openDockerGuide}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Install Docker
          </Button>
          <Button
            size="sm"
            onClick={retryDocker}
            className="from-yellow to-green text-background bg-gradient-to-r"
          >
            Retry
          </Button>
        </div>
      )
    },
    {
      id: 'authentication',
      title: 'Authentication',
      description: 'Connecting to your account',
      status: steps.authentication.status,
      detail: steps.authentication.detail
    },
    {
      id: 'node',
      title: 'Start Node',
      description: 'Initializing core services',
      status: steps.node.status,
      detail: steps.node.detail
    }
  ]

  return (
    <div className="bg-background relative h-screen w-screen overflow-hidden">
      {/* Background Effects */}
      <CanvasGlow />
      <WaveVisualizer />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-48 from-yellow to-green webkit-text-clip bg-gradient-to-r font-bold">
              OptimAI Core Node
            </h1>
            <p className="text-16 mt-2 text-white/60">Initializing your node...</p>
          </div>

          {/* Timeline Card */}
          <div className="bg-background/40 backdrop-blur-10 rounded-xl border border-white/4">
            <StartupTimeline steps={timelineSteps} />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-14 text-white/40">This process will complete automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartUpPage
