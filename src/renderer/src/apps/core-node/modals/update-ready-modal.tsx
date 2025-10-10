import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

const COUNTDOWN_SECONDS = 60 // 60 seconds countdown

export function UpdateReadyModal() {
  const open = useIsModalOpen(Modals.UPDATE_READY)

  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col overflow-hidden md:min-h-[420px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-28">Update Available</DialogTitle>
          <DialogDescription>
            A new version is ready to install. The application will restart automatically.
          </DialogDescription>
        </DialogHeader>
        <UpdateReadyContent />
      </DialogContent>
    </Dialog>
  )
}

const UpdateReadyContent = () => {
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

  const getProgressPercentage = () => {
    return ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100
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
    <>
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Countdown Display */}
        {!isUpdating && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-32">
              {/* Background circle */}
              <svg className="absolute inset-0 size-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/10"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white"
                  strokeLinecap="round"
                  strokeDasharray={364.42}
                  animate={{
                    strokeDashoffset: 364.42 - (364.42 * getProgressPercentage()) / 100
                  }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </svg>
              {/* Countdown text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-24 font-semibold text-white tabular-nums">
                  {formatTime(countdown)}
                </span>
              </div>
            </div>
            <p className="text-14 text-white/60">
              The application will restart automatically to apply the update
            </p>
          </div>
        )}

        {/* Updating State */}
        {isUpdating && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {/* Smooth Ripple Wave Animation */}
            <div className="relative flex size-24 items-center justify-center">
              {/* Ripple waves */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/20"
                  initial={{ width: 32, height: 32, opacity: 0 }}
                  animate={{
                    width: [32, 96, 96],
                    height: [32, 96, 96],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'easeOut'
                  }}
                />
              ))}

              {/* Center icon with subtle pulse */}
              <motion.div
                className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <svg
                  className="size-7"
                  width="183"
                  height="161"
                  viewBox="0 0 183 161"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="updatePiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f6f655" />
                      <stop offset="100%" stopColor="#5eed87" />
                    </linearGradient>
                  </defs>
                  <g clipPath="url(#updatePiClip)">
                    <path
                      d="M178.941 160.378H155.28C154.012 160.378 152.841 159.694 152.158 158.571L76.1517 26.9389C75.42 25.7182 75.42 24.2535 76.1517 22.984L88.0064 2.47748C89.5187 -0.159078 93.3239 -0.159078 94.8362 2.47748L176.307 143.582L182.453 154.226C184.014 156.911 182.063 160.329 178.941 160.329V160.378Z"
                      fill="url(#updatePiGradient)"
                    />
                    <path
                      d="M114.838 160.378C114.448 160.524 114.009 160.573 113.57 160.573H89.8602C89.4212 160.573 88.9821 160.524 88.5918 160.378C87.7137 160.085 86.9331 159.499 86.4453 158.62L61.9554 116.142C60.4431 113.506 56.6867 113.506 55.1744 116.142L30.9772 158.083C30.1479 159.499 28.6355 160.378 26.9769 160.378H4.0481C0.877102 160.378 -1.12307 156.96 0.486825 154.177L6.73125 143.338L46.1492 75.1781C48.5397 70.735 53.1742 67.659 58.5405 67.659C63.9068 67.659 68.1511 70.3932 70.6391 74.5433H70.7366L116.984 154.714C118.253 156.96 117.082 159.597 114.838 160.378Z"
                      fill="url(#updatePiGradient)"
                    />
                  </g>
                  <defs>
                    <clipPath id="updatePiClip">
                      <rect width="183" height="160" fill="white" transform="translate(0 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
              </motion.div>

              {/* Orbiting dots */}
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
                      className="size-1.5 -translate-x-1/2 -translate-y-10 rounded-full"
                      style={{
                        background: i === 0 ? '#f6f655' : i === 1 ? '#a6ed6e' : '#5eed87'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <motion.p
                className="text-16 font-medium text-white"
                animate={{
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                Installing the update
              </motion.p>
              <p className="text-14 text-white/60">The application will restart automatically</p>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          variant="primary"
          className="min-w-[200px]"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          Update Now
        </Button>
      </DialogFooter>
    </>
  )
}

export default UpdateReadyModal
