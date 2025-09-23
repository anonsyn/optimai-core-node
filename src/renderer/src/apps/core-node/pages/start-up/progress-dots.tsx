import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { cn } from '@/utils/tw'
import { StartupPhase, useStartup } from './provider'

const phases = [
  StartupPhase.INITIALIZING,
  StartupPhase.CHECKING_UPDATES,
  StartupPhase.CHECKING_DOCKER,
  StartupPhase.INITIALIZING_CRAWLER,
  StartupPhase.CHECKING_AUTH,
  StartupPhase.STARTING_NODE,
  StartupPhase.COMPLETED
]

const ProgressDots = () => {
  const { phase } = useStartup()

  const currentIndex = useMemo(() => {
    const index = phases.findIndex((p) => p === phase)
    return index === -1 ? 0 : index
  }, [phase])

  return (
    <div className="flex items-center gap-2">
      {phases.map((_, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex
        const isFuture = index > currentIndex

        return (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: 'easeOut'
            }}
          >
            {/* Connection Line */}
            {index < phases.length - 1 && (
              <motion.div
                className="absolute top-1/2 left-full h-[1px] w-2 -translate-y-1/2"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: isPast ? 1 : 0.3,
                  opacity: isPast ? 0.8 : 0.2,
                  background: isPast
                    ? 'linear-gradient(90deg, #5EED87 0%, #5EED87 100%)'
                    : 'rgba(255, 255, 255, 0.1)'
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ transformOrigin: 'left center' }}
              />
            )}

            {/* Dot */}
            <div
              className={cn(
                'relative size-2 rounded-full transition-all duration-300',
                isActive && 'size-2.5'
              )}
            >
              <motion.div
                className={cn(
                  'absolute inset-0 rounded-full',
                  isActive && 'from-yellow to-green bg-gradient-to-r',
                  isPast && 'bg-green',
                  isFuture && 'bg-white/20'
                )}
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: isActive ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              />

              {/* Glow Effect for Active Dot */}
              {isActive && (
                <motion.div
                  className="bg-green/60 absolute inset-0 rounded-full blur-md"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.8, 0.3, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Inner Dot for Future States */}
              {isFuture && <div className="bg-background absolute inset-0.5 rounded-full" />}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ProgressDots
