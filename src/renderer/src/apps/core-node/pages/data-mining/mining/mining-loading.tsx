import { Icon } from '@/components/ui/icon'
import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { motion } from 'framer-motion'

interface MiningLoadingProps {
  status: MiningWorkerStatus
}

const statusMessages: Record<string, string> = {
  [MiningStatus.Idle]: 'Starting mining service...',
  [MiningStatus.Initializing]: 'Checking system requirements...',
  [MiningStatus.InitializingCrawler]: 'Initializing crawler service...'
}

const statusIcons: Record<string, string> = {
  [MiningStatus.Idle]: 'Pickaxe',
  [MiningStatus.Initializing]: 'Settings',
  [MiningStatus.InitializingCrawler]: 'Globe'
}

export const MiningLoading = ({ status }: MiningLoadingProps) => {
  const message = statusMessages[status.status] || 'Loading...'
  const iconName = statusIcons[status.status] || 'LoaderCircle'

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Icon Container */}
        <div className="relative">
          {/* Glow Background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="bg-main absolute inset-0 rounded-full blur-2xl"
          />

          {/* Icon Background Circle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="from-yellow/20 to-green/20 relative h-24 w-24 rounded-full bg-gradient-to-r"
          >
            <div className="bg-background absolute inset-[1px] rounded-full" />
          </motion.div>

          {/* Main Icon */}
          <motion.div
            animate={{
              rotate: status.status === MiningStatus.InitializingCrawler ? 360 : 0
            }}
            transition={{
              duration: status.status === MiningStatus.InitializingCrawler ? 2 : 0,
              repeat: status.status === MiningStatus.InitializingCrawler ? Infinity : 0,
              ease: 'linear'
            }}
          >
            <Icon icon={iconName} className="text-main absolute inset-0 m-auto size-10" />
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <motion.h3
            key={status.status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-20 font-semibold text-white"
          >
            {message}
          </motion.h3>

          {/* Progress Indicators */}
          <div className="mt-4 flex items-center gap-2">
            <ProgressDot active={true} completed={status.status !== MiningStatus.Idle} />
            <ProgressDot
              active={status.status === MiningStatus.Initializing}
              completed={status.status === MiningStatus.InitializingCrawler}
            />
            <ProgressDot active={status.status === MiningStatus.InitializingCrawler} completed={false} />
          </div>

          {/* Additional Info */}
          <p className="text-13 mt-4 text-white/40">
            {status.status === MiningStatus.InitializingCrawler
              ? 'This may take a few moments on first run...'
              : 'Preparing mining environment...'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const ProgressDot = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <motion.div
    animate={{
      scale: active ? [1, 1.2, 1] : 1,
      opacity: completed ? 1 : 0.3
    }}
    transition={{
      scale: {
        duration: 1,
        repeat: active ? Infinity : 0,
        ease: 'easeInOut'
      }
    }}
    className={`h-2 w-2 rounded-full ${
      completed ? 'bg-green' : active ? 'bg-main' : 'bg-white/20'
    }`}
  />
)
