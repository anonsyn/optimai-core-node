import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
// import MiningConstellation from './mining-constellation'
import MiningSpinner from './mining-spinner'

interface MiningLoadingProps {
  status: MiningWorkerStatus
}

const statusMessages: Record<string, string> = {
  [MiningStatus.Idle]: 'Getting Ready',
  [MiningStatus.Initializing]: 'Checking System',
  [MiningStatus.InitializingCrawler]: 'Setting Things Up'
}

const statusDescriptions: Record<string, string> = {
  [MiningStatus.Idle]: 'Getting your device ready',
  [MiningStatus.Initializing]: 'Making sure everything works with your device',
  [MiningStatus.InitializingCrawler]: 'Setting up data tools'
}

export const MiningLoading = ({ status }: MiningLoadingProps) => {
  const [showFirstRunNotice, setShowFirstRunNotice] = useState(false)
  const [progress, setProgress] = useState(0)
  const message = statusMessages[status.status] || 'Loading...'
  const description = statusDescriptions[status.status] || 'Please wait...'

  // Fake progress that slows down and never completes
  // Using arctan formula for very slow, realistic progress (10GB+ download)
  useEffect(() => {
    if (status.status === MiningStatus.InitializingCrawler) {
      setProgress(0)
      let currentProgress = 0
      let step = 0.005 // Very small step for slow progress

      const interval = setInterval(() => {
        // Add randomness to simulate varying download speeds
        const randomStep = Math.random() * (step - 0.0001) + 0.0001
        currentProgress += randomStep

        // Arctan formula for asymptotic approach
        const newProgress =
          Math.round((Math.atan(currentProgress) / (Math.PI / 2)) * 100 * 1000) / 1000

        // Slow down even more after 70%
        if (newProgress >= 70) {
          step = 0.004
        }

        if (newProgress >= 80) {
          step = 0.002
        }

        // Almost stop after 90%
        if (newProgress >= 90) {
          step = 0.001
        }

        setProgress(Math.min(newProgress, 99.9)) // Never reach 100%
      }, 100)

      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [status.status])

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
        className="relative z-10 flex w-full max-w-md flex-col items-center"
      >
        {/* Mining Visualization */}
        <div className="relative h-48 w-full">
          <MiningSpinner status={status.status} />
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
              className="text-13 max-w-xs text-white/80"
            >
              {status.status === MiningStatus.InitializingCrawler ? (
                <span>
                  Downloading components:{' '}
                  <span className="tabular-nums">{progress.toFixed(1)}</span>%
                </span>
              ) : (
                description
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* First Run Notice */}
        <AnimatePresence>
          {showFirstRunNotice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="border-yellow/20 bg-yellow/5 mt-8 flex max-w-sm items-start gap-2 rounded-lg border p-3"
            >
              <Info className="text-yellow mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="text-12 text-white/70">
                <p className="text-yellow font-medium">First-time setup</p>
                <p className="mt-1">
                  This can take a few minutes while we download and set up what&apos;s needed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
