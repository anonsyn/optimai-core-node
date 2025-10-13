import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { Download, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const COUNTDOWN_SECONDS = 60 // 60 seconds countdown

export function UpdateReadyModal() {
  const open = useIsModalOpen(Modals.UPDATE_READY)

  return (
    <Dialog open={open}>
      <DialogContent
        className="overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <UpdateReadyContent />
      </DialogContent>
    </Dialog>
  )
}

const UpdateReadyContent = () => {
  const { version } = useModalData(Modals.UPDATE_READY) || {}
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isUpdating, setIsUpdating] = useState(false)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedUpdateRef = useRef(false)

  // Reset countdown when component mounts
  useEffect(() => {
    setCountdown(COUNTDOWN_SECONDS)
    setIsUpdating(false)
    hasStartedUpdateRef.current = false
  }, [])

  const handleUpdate = useCallback(() => {
    if (isUpdating || hasStartedUpdateRef.current) return

    console.log('UPDATE')

    setIsUpdating(true)
    hasStartedUpdateRef.current = true

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // Trigger the update
    window.updaterIPC.quitAndInstall()
  }, [isUpdating])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle countdown
  useEffect(() => {
    if (!isUpdating) {
      // Clear any existing interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const newValue = prev - 1

          // Check if countdown finished
          if (newValue <= 0) {
            // Clear interval immediately to prevent further ticks
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }

            // Trigger update
            if (!hasStartedUpdateRef.current) {
              handleUpdate()
            }
            return 0
          }

          return newValue
        })
      }, 1000)

      // Cleanup interval on unmount
      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
      }
    }
  }, [isUpdating, handleUpdate])

  return (
    <div className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="bg-background relative mx-auto mb-4 flex size-18 items-center justify-center rounded-full">
          <div className="bg-secondary relative z-10 flex size-11 items-center justify-center rounded-full">
            <RefreshCcw className="size-6 text-white" />
          </div>

          {isUpdating && (
            <div className="absolute inset-0">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 size-1.5"
                  style={{
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    rotate: [i * 120, i * 120 + 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <div
                    className="size-1.5 -translate-x-1/2 -translate-y-8 rounded-full"
                    style={{
                      background: i === 0 ? '#f6f655' : i === 1 ? '#a6ed6e' : '#5eed87'
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <h3 className="text-20 font-semibold text-white">
          Update Available {version && `- v${version}`}
        </h3>
        <p className="text-16 mt-1 text-balance text-white/50">
          The latest version is ready to install and will restart automatically after updating
        </p>
      </motion.div>

      <div className="space-y-2.5 pt-8">
        <Button className="w-full" onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="size-4" />
              Install update
            </>
          )}
        </Button>
        <div className="text-16 flex items-center justify-between text-white/50">
          {isUpdating ? (
            <span>Your application will be restart soon</span>
          ) : (
            <>
              <span>Auto update will begins in:</span>
              <span className="tabular-nums">{formatTime(countdown)}s</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdateReadyModal
