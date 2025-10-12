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
    title: 'Preparing the App',
    description: 'Setting things up for a smooth start.',
    icon: 'CPU',
    code: '> initializing...'
  },
  {
    phase: StartupPhase.CHECKING_UPDATES,
    title: 'Looking for Updates',
    description: 'Checking for the latest version.',
    icon: 'Globe',
    code: '> checking updates...'
  },
  {
    phase: StartupPhase.CHECKING_DOCKER,
    title: 'Verifying Docker',
    description: 'Ensuring Docker is running properly.',
    icon: 'LoaderCircle',
    code: '> verifying docker...'
  },
  {
    phase: StartupPhase.CHECKING_AUTH,
    title: 'Signing You In',
    description: 'Confirming your account access.',
    icon: 'LockOpen',
    code: '> authenticating...'
  },
  {
    phase: StartupPhase.STARTING_NODE,
    title: 'Starting Your Node',
    description: 'Connecting services to the network.',
    icon: 'LoaderCircle',
    code: '> launching node...'
  },
  {
    phase: StartupPhase.COMPLETED,
    title: 'All Set!',
    description: 'You’re ready to go.',
    icon: 'CircleCheck',
    code: '> ready'
  }
]

const Status = ({ className, ...props }: StatusProps) => {
  const { error, canRetry, retry, phase } = useStartup()
  const [typedCode, setTypedCode] = useState<string>('')
  const lastHealthyPhaseRef = useRef<StartupPhase>(StartupPhase.INITIALIZING)

  useEffect(() => {
    if (phase !== StartupPhase.ERROR) {
      lastHealthyPhaseRef.current = phase
    }
  }, [phase])

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
      <div className="flex w-full flex-col items-center gap-8">
        {/* Network Constellation Visualization */}
        <div className="relative h-64 w-full max-w-[280px]">
          <NetworkConstellation phase={displayPhase} />
        </div>

        {/* Terminal-style Code Display */}
        <div className="text-16 flex items-center gap-3 font-mono">
          <span className="text-green">{typedCode}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="bg-green inline-block h-4 w-2"
          />
        </div>

        {/* Title and Description - Minimal */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="min-h-[42px]">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStep.phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-28 leading-normal font-medium text-white"
              >
                {currentStep.title}
              </motion.h2>
            </AnimatePresence>
          </div>

          <div className="min-h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep.phase + '-desc'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-16 max-w-md text-white/60"
              >
                {currentStep.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Status feed removed as requested */}

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
