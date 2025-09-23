import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { motion, AnimatePresence } from 'framer-motion'
import { HTMLAttributes, useMemo, useRef, useEffect, useState } from 'react'
import { StartupPhase, useStartup } from './provider'
import NetworkConstellation from './network-constellation'

interface StatusProps extends HTMLAttributes<HTMLDivElement> {}

type Step = {
  phase: StartupPhase
  title: string
  description: string
  icon: 'CPU' | 'LoaderCircle' | 'Globe' | 'Hourglass' | 'CircleCheck' | 'LockOpen'
  code: string // Terminal-like code representation
}

const steps: Step[] = [
  {
    phase: StartupPhase.INITIALIZING,
    title: 'System Initialization',
    description: 'Preparing your local environment and core services',
    icon: 'CPU',
    code: '> node.init()'
  },
  {
    phase: StartupPhase.CHECKING_UPDATES,
    title: 'Update Verification',
    description: 'Ensuring you have the latest version installed',
    icon: 'Globe',
    code: '> node.checkUpdates()'
  },
  {
    phase: StartupPhase.CHECKING_DOCKER,
    title: 'Docker Validation',
    description: 'Verifying container runtime and daemon status',
    icon: 'LoaderCircle',
    code: '> docker.validate()'
  },
  {
    phase: StartupPhase.INITIALIZING_CRAWLER,
    title: 'Crawler Setup',
    description: 'Initializing Crawl4AI service container',
    icon: 'Hourglass',
    code: '> crawler.initialize()'
  },
  {
    phase: StartupPhase.CHECKING_AUTH,
    title: 'Authentication',
    description: 'Securing your session with encrypted tokens',
    icon: 'LockOpen',
    code: '> auth.verify()'
  },
  {
    phase: StartupPhase.STARTING_NODE,
    title: 'Node Activation',
    description: 'Starting OptimAI core services and connections',
    icon: 'LoaderCircle',
    code: '> node.start()'
  },
  {
    phase: StartupPhase.COMPLETED,
    title: 'Launch Ready',
    description: 'All systems operational and synchronized',
    icon: 'CircleCheck',
    code: '> node.ready()'
  }
]

const Status = ({ className, ...props }: StatusProps) => {
  const { statuses, error, canRetry, retry, phase } = useStartup()
  const [latestStatus, setLatestStatus] = useState<string>('')
  const [typedCode, setTypedCode] = useState<string>('')
  const lastHealthyPhaseRef = useRef<StartupPhase>(StartupPhase.INITIALIZING)

  useEffect(() => {
    if (phase !== StartupPhase.ERROR) {
      lastHealthyPhaseRef.current = phase
    }
  }, [phase])

  // Get latest status message
  useEffect(() => {
    if (statuses.length > 0) {
      const latest = statuses[statuses.length - 1]
      setLatestStatus(latest.message)
    }
  }, [statuses])

  const displayPhase = phase === StartupPhase.ERROR ? lastHealthyPhaseRef.current : phase

  const currentStep = useMemo(() => {
    const step = steps.find((s) => s.phase === displayPhase)
    return step || steps[0]
  }, [displayPhase])

  // Typewriter effect for code
  useEffect(() => {
    const targetCode = currentStep.code
    let currentIndex = 0
    setTypedCode('')

    const typeInterval = setInterval(() => {
      if (currentIndex <= targetCode.length) {
        setTypedCode(targetCode.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, 80) // Slower for better visibility

    return () => clearInterval(typeInterval)
  }, [currentStep.code])

  const hasError = canRetry && Boolean(error)

  return (
    <div className={cn('relative w-full', className)} {...props}>
      <div className="flex flex-col items-center gap-6">

        {/* Network Constellation Visualization */}
        <div className="relative h-64 w-full max-w-3xl">
          <NetworkConstellation phase={displayPhase} />

          {/* Floating Icon in Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.phase}
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 to-green/20 blur-2xl" />
                <Icon
                  icon={currentStep.icon}
                  className={cn(
                    'relative size-12 text-white drop-shadow-2xl',
                    currentStep.icon === 'LoaderCircle' && 'animate-[spin_2s_linear_infinite]'
                  )}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Terminal-style Code Display */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-green">{typedCode}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block h-4 w-2 bg-green"
          />
        </div>

        {/* Title and Description - Minimal */}
        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStep.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-2xl font-light text-white"
            >
              {currentStep.title}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep.phase + '-desc'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-w-md text-sm text-white/40"
            >
              {currentStep.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Status Feed - Ultra Minimal */}
        <AnimatePresence mode="wait">
          {latestStatus && !hasError && (
            <motion.div
              key={latestStatus}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="size-1 rounded-full bg-green/60"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-white/30">{latestStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State - Refined */}
        <AnimatePresence>
          {hasError && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3 rounded-2xl bg-destructive/5 p-6"
            >
              <div className="flex items-center gap-2 text-sm text-destructive">
                <Icon icon="Info" className="size-4" />
                <span>{error}</span>
              </div>
              <button
                onClick={retry}
                className="text-xs text-destructive/70 underline underline-offset-2 transition hover:text-destructive"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Status