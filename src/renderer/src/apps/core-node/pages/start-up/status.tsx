import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { AnimatePresence, motion } from 'framer-motion'
import { HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react'
import NetworkConstellation from './network-constellation'
import { StartupPhase, useStartup } from './provider'

interface StatusProps extends HTMLAttributes<HTMLDivElement> {}

type Step = {
  phase: StartupPhase
  title: string
  description: string
  icon: 'CPU' | 'LoaderCircle' | 'Globe' | 'CircleCheck' | 'LockOpen'
  code: string // Terminal-like code representation
}

const steps: Step[] = [
  {
    phase: StartupPhase.INITIALIZING,
    title: 'Getting Things Ready',
    description: 'We’re setting up your app and checking basics',
    icon: 'CPU',
    code: '> getting ready...'
  },
  {
    phase: StartupPhase.CHECKING_UPDATES,
    title: 'Checking for Updates',
    description: 'Looking for the latest version',
    icon: 'Globe',
    code: '> checking updates...'
  },
  {
    phase: StartupPhase.CHECKING_DOCKER,
    title: 'Checking Docker',
    description: 'Making sure Docker is installed and running',
    icon: 'LoaderCircle',
    code: '> checking docker...'
  },
  {
    phase: StartupPhase.CHECKING_AUTH,
    title: 'Signing You In',
    description: 'Confirming your account details',
    icon: 'LockOpen',
    code: '> checking account...'
  },
  {
    phase: StartupPhase.STARTING_NODE,
    title: 'Starting OptimAI',
    description: 'Starting services and getting connected',
    icon: 'LoaderCircle',
    code: '> starting...'
  },
  {
    phase: StartupPhase.COMPLETED,
    title: 'All Set',
    description: 'You’re good to go',
    icon: 'CircleCheck',
    code: '> ready'
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
      <div className="flex w-full flex-col items-center gap-6">
        {/* Network Constellation Visualization */}
        <div className="relative h-64 w-full max-w-[280px]">
          <NetworkConstellation phase={displayPhase} />
        </div>

        {/* Terminal-style Code Display */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-green">{typedCode}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="bg-green inline-block h-4 w-2"
          />
        </div>

        {/* Title and Description - Minimal */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStep.phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-24 leading-normal font-medium text-white"
              >
                {currentStep.title}
              </motion.h2>
            </AnimatePresence>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep.phase + '-desc'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-md max-w-md text-white/60"
              >
                {currentStep.description}
              </motion.p>
            </AnimatePresence>
          </div>
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
                    className="bg-green/60 size-1 rounded-full"
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
              <span className="text-14 text-white/50">{latestStatus}</span>
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
              className="bg-destructive/5 flex flex-col items-center gap-3 rounded-2xl p-6"
            >
              <div className="text-destructive flex items-center gap-2 text-sm">
                <Icon icon="Info" className="size-4" />
                <span>{error}</span>
              </div>
              <button
                onClick={retry}
                className="text-destructive/70 hover:text-destructive text-xs underline underline-offset-2 transition"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Status
