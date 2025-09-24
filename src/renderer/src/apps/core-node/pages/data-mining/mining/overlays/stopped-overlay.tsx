import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { useState } from 'react'

export const StoppedOverlay = () => {
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await window.nodeIPC.startNode()
    } catch (error) {
      console.error('Failed to start mining:', error)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-4 w-full max-w-md"
      >
        <div className="bg-background relative overflow-hidden rounded-xl border border-white/5 p-6 backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <Icon icon="Square" className="size-8 text-white/40" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-18 font-medium text-white">Mining Stopped</h3>
            <p className="text-13 mt-2 text-white/60">
              Mining is currently stopped. Start mining to begin processing assignments and earning
              rewards.
            </p>
          </div>

          {/* Action */}
          <div className="mt-6">
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full"
              variant="primary"
            >
              {isStarting ? (
                <>
                  <Icon icon="LoaderCircle" className="mr-2 size-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Icon icon="ArrowRight" className="mr-2 size-4" />
                  Start Mining
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
