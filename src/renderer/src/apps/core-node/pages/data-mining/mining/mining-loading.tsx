import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
// import MiningConstellation from './mining-constellation'
import MiningSpinner from './mining-spinner'

export const MiningLoading = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
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
  }, [])

  return (
    <div className="relative flex h-full w-full justify-center overflow-hidden pt-46">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center"
      >
        {/* Mining Visualization */}
        <div className="relative h-40 w-full">
          <MiningSpinner />
        </div>

        {/* Title and Description */}
        <div className="mt-2 flex flex-col items-center gap-1 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-20 leading-normal font-medium text-white"
          >
            Getting things ready
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-16 max-w-xs text-white/50"
          >
            <span>
              Setting up your node: <span className="tabular-nums">{progress.toFixed(1)}</span>%
            </span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
