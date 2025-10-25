import AnimatedNumber from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

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
  // const [verifyAttempts, setVerifyAttempts] = useState(0)
  const [dockerStatus, setDockerStatus] = useState<DockerStatus>('checking')

  const [debouncedProgress] = useDebounce(downloadProgress, 400, { maxWait: 1000 })

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
        // setVerifyAttempts((prev) => prev + 1)
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
      // setVerifyAttempts(0)
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
    <div className="flex flex-col">
      {/* Content Area */}
      <div className="min-h-[240px] flex-1 space-y-6">
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
            <p className="text-14 text-white/80">Getting Docker ready...</p>
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
              <div className="bg-background mx-auto mb-6 flex size-18 items-center justify-center rounded-full">
                <div className="bg-secondary flex size-11 items-center justify-center rounded-full">
                  <Icon className="size-6" icon="Optimai" />
                </div>
              </div>
              <h3 className="text-20 font-semibold text-white">Setting up your Node</h3>
              <p className="text-16 mt-1 text-balance text-white/50">
                {downloadError
                  ? downloadError
                  : 'We’ll help you get started by downloading Docker Desktop, so your node can run smoothly on your device'}
              </p>
            </div>

            {/* Download Info */}
            {/* <div className="rounded-xl bg-white/5 p-4">
              <div className="space-y-2 text-center">
                <p className="text-14 text-white/80">Download size: ~600MB</p>
                <p className="text-14 text-white/80">Estimated time: 2-5 minutes</p>
              </div>
            </div> */}
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
              <div className="bg-background relative mx-auto mb-6 flex size-18 items-center justify-center rounded-full">
                <div className="bg-secondary flex size-11 items-center justify-center rounded-full">
                  <Download className="size-6 text-white" />
                </div>
                <svg
                  className="absolute inset-0 size-full -rotate-90"
                  viewBox="0 0 72 72"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="paint0_linear_3216_1118"
                      x1="-30"
                      y1="31.7308"
                      x2="30"
                      y2="31.7308"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F6F655" />
                      <stop offset="1" stopColor="#5EED87" />
                    </linearGradient>
                  </defs>
                  {/* Progress circle */}
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="url(#paint0_linear_3216_1118)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 188.5, strokeDashoffset: 188.5 }}
                    animate={{
                      strokeDashoffset: 188.5 - (188.5 * downloadProgress) / 100
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </svg>
              </div>
              <h3 className="text-20 font-semibold text-white">Download in Progress</h3>
              <p className="text-16 mt-1 text-balance text-white/50">
                It won’t take long, we’re fetching the files you need{' '}
              </p>
            </div>

            {/* Download Progress */}
            {/* <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-14 text-white/80">Progress</span>
                <span className="text-14 font-bold text-white">
                  {Math.round(downloadProgress)}%
                </span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="from-yellow to-green absolute inset-y-0 left-0 rounded-full bg-gradient-to-r"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div> */}
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
              <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full border border-white/10 bg-black/30">
                <Icon className="size-7 shrink-0 text-white" icon="Docker" />
              </div>
              <h3 className="text-20 font-semibold text-white">Download Complete</h3>
              <p className="text-16 mt-1 text-balance text-white/50">
                Nice work, we’re ready to install Docker so your node can start soon
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
              <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full border border-white/10 bg-black/30">
                <Icon className="size-7 shrink-0 text-white" icon="Docker" />
              </div>

              <h3 className="text-20 font-semibold text-white">
                {dockerStatus === 'not-running'
                  ? 'Start Docker to Finish Setup'
                  : 'Installing Docker'}
              </h3>

              <p className="text-16 mt-1 text-balance text-white/50">
                {dockerStatus === 'checking' && 'We’re checking your Docker installation...'}
                {dockerStatus === 'not-installed' &&
                  'The installation is underway, we’ll notify you when it’s ready to go'}
                {dockerStatus === 'not-running' && 'Open Docker on your desktop and we’re all set'}
              </p>
            </div>

            {/* Dynamic Guide Content */}
            {/* {(dockerStatus === 'checking' || dockerStatus === 'not-installed') && (
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
                      ? 'Drag Docker into your Applications folder'
                      : getPlatformName() === 'Windows'
                        ? 'Run the installer and follow the steps'
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
                    {getPlatformName() === 'macOS' ? 'Applications' : 'Start menu'}
                  </p>
                </div>
              </motion.div>
            )} */}
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
            <h3 className="text-20 font-semibold text-white">Docker is ready!</h3>
            <p className="text-16 mt-1 text-balance text-white/50">
              Everything is set up correctly
            </p>
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
          {state === 'no-installer' && (
            <>
              <Icon icon="Docker" className="size-4" />
              <span>Download for {getPlatformName()}</span>
            </>
          )}
          {state === 'downloading' && (
            <>
              <span className="tabular-nums">
                <AnimatedNumber
                  value={debouncedProgress}
                  format={{
                    maximumFractionDigits: 0,
                    minimumIntegerDigits: 2
                  }}
                />
                %{' '}
              </span>
              <span>Complete</span>
            </>
          )}
          {state === 'has-installer' && 'Install Now'}
          {state === 'installing' && (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Checking your installation...
            </>
          )}
          {state === 'docker-ready' && 'Starting Node...'}
        </Button>
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => window.windowIPC.openExternalLink('https://docs.docker.com/desktop/')}
        >
          Get help
        </Button>
      </div>
    </div>
  )
}
