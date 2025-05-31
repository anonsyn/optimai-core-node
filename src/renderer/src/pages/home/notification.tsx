import Token from '@/components/branding/token'
import { useAppSelector } from '@/hooks/redux'
import { nodeSelectors } from '@/store/slices/node'
import NumberFlow from '@number-flow/react'
import { format } from 'date-fns'
import { animate, AnimatePresence, motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'

const formatNextExecution = (timestamp: string | number | undefined): string => {
  if (!timestamp) return '--:--'
  const date = new Date(timestamp)
  return format(date, 'dd/MM/yyyy HH:mm:ss')
}

const Notification = () => {
  const cycle = useAppSelector(nodeSelectors.cycle)
  const latestNotificationReward = useAppSelector(nodeSelectors.latestNotificationReward)
  const progress = useMotionValue(0)
  const maskSize = useMotionTemplate`${progress}% 100%`

  useEffect(() => {
    if (cycle) {
      const lastUptime = cycle.createdAt
      const nextUptimeReward = cycle.refreshAt
      const now = Date.now()
      const duration = nextUptimeReward - lastUptime
      const passedTime = now - lastUptime
      const remainingTime = duration - passedTime
      const currentProgress = (passedTime / duration) * 100

      progress.set(currentProgress)

      const playControl = animate(progress, 100, {
        duration: remainingTime / 1000,
        bounce: 0,
        ease: 'linear'
      })

      return () => {
        playControl.stop()
      }
    }
  }, [cycle])

  return (
    <div className="relative h-9 w-full">
      <motion.div
        key="notification"
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="absolute inset-0 h-full w-full overflow-hidden backdrop-blur-sm"
      >
        <motion.div
          className="absolute inset-0 border-t border-white/10"
          style={{
            backgroundImage:
              'linear-gradient(136deg, rgba(255, 255, 51, 0.10) 10.07%, rgba(51, 255, 75, 0.10) 86.33%)',
            boxShadow:
              '0px 9.564px 28.693px 0px rgba(0, 0, 0, 0.20), 0px 0px 19.128px -3.188px rgba(4, 63, 57, 0.15) inset',
            maskImage: 'linear-gradient(to right, black, black)',
            maskPosition: 'center left',
            maskRepeat: 'no-repeat',
            maskSize
          }}
        />
        <div className="bg-raydial-15 absolute inset-0 flex items-center justify-between">
          <AnimatePresence mode="sync">
            {latestNotificationReward ? (
              <motion.div
                key={latestNotificationReward.timestamp}
                initial={{
                  y: '100%',
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                exit={{
                  y: '-100%',
                  opacity: 0
                }}
                transition={{
                  duration: 0.5,
                  bounce: 0
                }}
                className="absolute inset-0 flex w-full items-center justify-between px-4"
              >
                <div className="flex items-center gap-1">
                  <p className="text-12 line-clamp-1 max-w-[80%] leading-relaxed font-medium text-white">
                    Earned{' '}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-12 flex items-center leading-normal font-normal text-white">
                      +
                      <NumberFlow
                        value={Number(latestNotificationReward.amount)}
                        trend="increasing"
                        format={{
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 4
                        }}
                      />
                    </p>
                    <Token className="size-4.5" />
                  </div>
                </div>
                <p className="text-12 line-clamp-1 max-w-[80%] leading-relaxed font-medium text-white">
                  {formatNextExecution(latestNotificationReward.timestamp)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{
                  y: '100%',
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                exit={{
                  y: '-100%',
                  opacity: 0
                }}
                transition={{
                  duration: 0.5,
                  bounce: 0
                }}
                className="absolute inset-0 flex items-center px-4"
              >
                <p className="text-12 line-clamp-1 w-full leading-relaxed font-medium text-white">
                  Great! You&apos;re all set—stay online and earn.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default Notification
