import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { Container, Download, Folder, Rocket, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SetupStepProps {
  onComplete: () => void
}

type SetupState =
  | 'checking'
  | 'no-installer'
  | 'downloading'
  | 'has-installer'
  | 'installing'
  | 'docker-ready'

type DockerStatus = 'checking' | 'not-installed' | 'not-running' | 'running'

export function SetupStep({ onComplete }: SetupStepProps) {
  const [state, setState] = useState<SetupState>('checking')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [verifyAttempts, setVerifyAttempts] = useState(0)
  const [dockerStatus, setDockerStatus] = useState<DockerStatus>('checking')

  useEffect(() => {
    // Check if installer already exists on mount
    const checkInstaller = async () => {
      const installerPath = await window.dockerIPC.getInstallerPath()
      if (installerPath) {
        setState('has-installer')
      } else {
        setState('no-installer')
      }
    }

    checkInstaller()
  }, [])

  // Auto-verify Docker installation every 4 seconds after installer opens
  useEffect(() => {
    if (state !== 'installing') return

    let interval: NodeJS.Timeout | undefined

    const checkDocker = async () => {
      try {
        // First check if Docker is installed
        const isInstalled = await window.dockerIPC.checkInstalled()

        if (!isInstalled) {
          setDockerStatus('not-installed')
          return false
        }

        // Then check if Docker is running
        const isRunning = await window.dockerIPC.checkRunning()

        if (!isRunning) {
          setDockerStatus('not-running')
          return false
        }

        // Success!
        setDockerStatus('running')
        setState('docker-ready')
        return true
      } catch {
        // Keep checking
        return false
      }
    }

    // Start checking immediately
    const startVerifying = async () => {
      setDockerStatus('checking')
      const success = await checkDocker()

      if (success) return

      // Continue polling every 15 seconds
      interval = setInterval(async () => {
        setVerifyAttempts((prev) => prev + 1)
        const success = await checkDocker()

        if (success) {
          clearInterval(interval)
        }
      }, 15000)
    }

    // Wait a bit before starting to check (give user time to start installation)
    const initialDelay: NodeJS.Timeout = setTimeout(() => {
      startVerifying()
    }, 3000)

    // Cleanup
    return () => {
      clearTimeout(initialDelay)
      if (interval) clearInterval(interval)
    }
  }, [state])

  useEffect(() => {
    if (state !== 'docker-ready' || dockerStatus !== 'running') {
      return
    }

    const timeoutId = setTimeout(() => {
      onComplete()
    }, 1000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dockerStatus])

  const startDownload = async () => {
    setState('downloading')
    setDownloadError(null)
    setDownloadProgress(0)

    // Listen for download progress
    const unsubscribe = window.dockerIPC.onDownloadProgress((progress) => {
      setDownloadProgress(progress.percent)

      if (progress.status === 'completed') {
        setState('has-installer')
      } else if (progress.status === 'error') {
        setDownloadError('Download failed. Please check your connection and try again.')
        setState('no-installer')
      }
    })

    const result = await window.dockerIPC.downloadInstaller()

    if (!result) {
      setDownloadError('Failed to start download. Please try again.')
      setState('no-installer')
    }

    return unsubscribe
  }

  const handleOpenInstaller = async () => {
    const success = await window.dockerIPC.openInstaller()
    if (success) {
      setState('installing')
      setVerifyAttempts(0)
      setDockerStatus('checking')
    } else {
      setDownloadError('Failed to open installer. Please open it manually from Downloads.')
    }
  }

  const getPlatformName = () => {
    const platform = window.navigator.platform.toLowerCase()
    if (platform.includes('mac')) return 'macOS'
    if (platform.includes('win')) return 'Windows'
    return 'Linux'
  }

  return (
    <div className="flex h-full flex-col">
      {/* Content Area */}
      <div className="flex-1 space-y-6">
        {/* Status Display */}
        {state === 'checking' && (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-4 text-center"
          >
            <Icon icon="LoaderCircle" className="mx-auto mb-4 size-8 animate-spin text-white/60" />
            <p className="text-14 text-white/80">Preparing Docker setup...</p>
          </motion.div>
        )}

        {state === 'no-installer' && (
          <motion.div
            key="no-installer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="bg-positive/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-full">
                <Download className="text-green size-7" />
              </div>
              <h3 className="text-16 font-semibold text-white">Download Docker Desktop</h3>
              <p className="text-14 mt-1 text-white/80">
                {downloadError ? downloadError : "Let's download Docker Desktop for your system"}
              </p>
            </div>

            {/* Download Info */}
            <div className="rounded-xl bg-white/5 p-4">
              <div className="space-y-2 text-center">
                <p className="text-12 text-white/80">Download size: ~600MB</p>
                <p className="text-12 text-white/80">Estimated time: 2-5 minutes</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'downloading' && (
          <motion.div
            key="downloading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="mb-3 text-center">
              <div className="bg-positive/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-full">
                <Download className="text-green size-7" />
              </div>
              <h3 className="text-16 font-semibold text-white">Download Docker Desktop</h3>
              <p className="text-14 mt-1 text-white/80">This will take a few minutes</p>
            </div>

            {/* Download Progress */}
            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-14 text-white/80">Progress</span>
                <span className="text-14 font-bold text-white">
                  {Math.round(downloadProgress)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="from-yellow to-green absolute inset-y-0 left-0 rounded-full bg-gradient-to-r"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {state === 'has-installer' && (
          <motion.div
            key="has-installer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="bg-positive/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-full">
                <Icon icon="CircleCheck" className="text-positive size-7" />
              </div>
              <h3 className="text-16 font-semibold text-white">Docker Desktop Ready</h3>
              <p className="text-14 mt-1 text-white/80">
                {downloadError ? downloadError : 'Installer is ready to launch'}
              </p>
            </div>
          </motion.div>
        )}

        {state === 'installing' && (
          <motion.div
            key={`installing-${dockerStatus}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              {dockerStatus === 'not-running' ? (
                <div className="bg-warning/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-full">
                  <Zap className="text-warning size-7" />
                </div>
              ) : (
                <motion.div className="bg-positive/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-full">
                  <Container className="text-green size-7" />
                </motion.div>
              )}

              <h3 className="text-16 font-semibold text-white">
                {dockerStatus === 'not-running' ? 'Start Docker Desktop' : 'Installing Docker'}
              </h3>

              <p className="text-14 mt-1 text-white/80">
                {dockerStatus === 'checking' && "We're checking for Docker installation..."}
                {dockerStatus === 'not-installed' &&
                  (verifyAttempts > 2
                    ? 'Taking a bit longer. Please complete the installation'
                    : 'Follow the installer steps to complete')}
                {dockerStatus === 'not-running' && 'Docker is installed but not running'}
              </p>
            </div>

            {/* Dynamic Guide Content */}
            {(dockerStatus === 'checking' || dockerStatus === 'not-installed') && (
              <motion.div
                key="not-installed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white/5 p-4"
              >
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-white/80" />
                  <p className="text-14 text-white/80">
                    {getPlatformName() === 'macOS'
                      ? 'Drag Docker to Applications folder'
                      : getPlatformName() === 'Windows'
                        ? 'Run the installer and follow the wizard'
                        : 'Run the installation script'}
                  </p>
                </div>
              </motion.div>
            )}

            {dockerStatus === 'not-running' && (
              <motion.div
                key="not-running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white/5 p-4"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="size-4 text-white/80" />
                  <p className="text-14 text-white/80">
                    Please open Docker Desktop from your{' '}
                    {getPlatformName() === 'macOS' ? 'Applications' : 'Start Menu'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Docker Ready State */}
        {state === 'docker-ready' && (
          <motion.div
            key="docker-ready"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="py-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="bg-positive/20 mx-auto mb-3 flex size-16 items-center justify-center rounded-full"
            >
              <Icon icon="CircleCheck" className="text-positive size-8" />
            </motion.div>
            <h3 className="text-18 font-semibold text-white">Docker is Ready!</h3>
            <p className="text-14 mt-2 text-white/80">Everything is set up correctly</p>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Action Button */}
      <div className="mt-auto pt-3">
        <Button
          onClick={
            state === 'no-installer'
              ? startDownload
              : state === 'has-installer'
                ? handleOpenInstaller
                : undefined
          }
          disabled={
            state === 'downloading' ||
            state === 'checking' ||
            state === 'installing' ||
            state === 'docker-ready'
          }
          className="from-yellow to-green w-full bg-gradient-to-r text-black hover:opacity-90 disabled:opacity-50"
        >
          {state === 'checking' && 'Preparing...'}
          {state === 'no-installer' && `Download for ${getPlatformName()}`}
          {state === 'downloading' && 'Downloading...'}
          {state === 'has-installer' && 'Open Installer'}
          {state === 'installing' && (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Verifying Installation...
            </>
          )}
          {state === 'docker-ready' && 'Launching Core Node...'}
        </Button>
      </div>
    </div>
  )
}
