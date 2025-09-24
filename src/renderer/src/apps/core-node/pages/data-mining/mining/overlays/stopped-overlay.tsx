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
      setIsStarting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-4 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-background/95 backdrop-blur-md"
      >
        <div className="p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/5 p-4">
              <Icon icon="Square" className="size-8 text-white/60" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-20 font-semibold text-white">Mining Stopped</h3>
            <p className="text-14 mt-3 text-white/60">
              Mining is currently stopped. Start mining to begin processing assignments and earning
              rewards.
            </p>

            {/* Status info */}
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <span className="text-12 text-white/40">Idle</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8">
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-main w-full text-black transition-all hover:bg-main/90"
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