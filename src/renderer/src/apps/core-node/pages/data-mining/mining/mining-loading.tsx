import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import MiningConstellation from './mining-constellation'

interface MiningLoadingProps {
  status: MiningWorkerStatus
}

const statusMessages: Record<string, string> = {
  [MiningStatus.Idle]: 'Mining Service Initialization',
  [MiningStatus.Initializing]: 'System Verification',
  [MiningStatus.InitializingCrawler]: 'Mining Tools Setup'
}

const statusDescriptions: Record<string, string> = {
  [MiningStatus.Idle]: 'Preparing your local mining environment',
  [MiningStatus.Initializing]: 'Verifying Docker and system compatibility',
  [MiningStatus.InitializingCrawler]: 'Initializing data collection services'
}

export const MiningLoading = ({ status }: MiningLoadingProps) => {
  const [showFirstRunNotice, setShowFirstRunNotice] = useState(false)
  const message = statusMessages[status.status] || 'Loading...'
  const description = statusDescriptions[status.status] || 'Please wait...'

  // Check if this is first run (InitializingCrawler status)
  useEffect(() => {
    if (status.status === MiningStatus.InitializingCrawler) {
      // Show notice after a short delay to not overwhelm
      const timer = setTimeout(() => setShowFirstRunNotice(true), 5000)
      return () => clearTimeout(timer)
    } else {
      setShowFirstRunNotice(false)
    }
  }, [status.status])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Background Glow Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Yellow glow */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="bg-yellow/10 absolute top-20 -left-40 h-80 w-80 rounded-full blur-[100px]"
        />

        {/* Green glow */}
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="bg-green/10 absolute -right-40 bottom-20 h-80 w-80 rounded-full blur-[100px]"
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6"
      >
        {/* Constellation Visualization */}
        <div className="relative h-48 w-full">
          <MiningConstellation status={status.status} />
        </div>

        {/* Title and Description */}
        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={status.status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-24 leading-normal font-medium text-white"
            >
              {message}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={status.status + '-desc'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-13 max-w-xs text-white/60"
            >
              {description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Phase Indicator - Subtle */}
        <div className="mt-2 flex items-center gap-3">
          <PhaseIndicator
            active={status.status === MiningStatus.Idle}
            completed={status.status !== MiningStatus.Idle}
          />
          <PhaseIndicator
            active={status.status === MiningStatus.Initializing}
            completed={status.status === MiningStatus.InitializingCrawler}
          />
          <PhaseIndicator
            active={status.status === MiningStatus.InitializingCrawler}
            completed={false}
          />
        </div>

        {/* First Run Notice */}
        <AnimatePresence>
          {showFirstRunNotice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="border-yellow/20 bg-yellow/5 mt-6 flex max-w-sm items-start gap-2 rounded-lg border p-3"
            >
              <Info className="text-yellow mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="text-12 text-white/70">
                <p className="text-yellow font-medium">First time setup</p>
                <p className="mt-1">
                  Initial configuration may take several minutes while we download and set up the
                  required mining tools.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

const PhaseIndicator = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <motion.div
    animate={{
      scale: active ? [1, 1.3, 1] : 1,
      opacity: completed ? 1 : 0.3
    }}
    transition={{
      scale: {
        duration: 1.5,
        repeat: active ? Infinity : 0,
        ease: 'easeInOut'
      }
    }}
    className={`h-1 w-8 rounded-full ${
      completed ? 'bg-green' : active ? 'bg-yellow' : 'bg-white/20'
    }`}
  />
)
