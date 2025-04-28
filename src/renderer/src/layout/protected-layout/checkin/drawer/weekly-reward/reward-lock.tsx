import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { AnimatePresence, motion } from 'framer-motion'
import { HTMLAttributes } from 'react'
import { Status } from './types'

interface RewardLockProps extends HTMLAttributes<HTMLDivElement> {
  status: Status
  progress?: number
}

const RewardLock = ({ className, status, progress = 0, ...props }: RewardLockProps) => {
  const isFailed = status === 'failed'
  const isInProgress = status === 'inProgress'
  const size = 48
  const strokeWidth = 1
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  const isCompleted = status === 'completed'

  return (
    <div
      className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', className)}
      {...props}
    >
      <div className="relative size-12">
        {isInProgress && (
          <svg
            className="absolute inset-0 h-full w-full animate-spin"
            style={{ animationDuration: '2000ms' }}
          >
            <circle
              className="text-accent/10"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="url(#progressGradient)"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        )}

        <AnimatePresence>
          {isCompleted && (
            <motion.svg
              className="relative z-10"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
            >
              <mask id="path-1-inside-1_4537_9543" fill="white">
                <path d="M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24ZM1.92 24C1.92 36.1944 11.8056 46.08 24 46.08C36.1944 46.08 46.08 36.1944 46.08 24C46.08 11.8056 36.1944 1.92 24 1.92C11.8056 1.92 1.92 11.8056 1.92 24Z" />
              </mask>
              <path
                d="M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24ZM1.92 24C1.92 36.1944 11.8056 46.08 24 46.08C36.1944 46.08 46.08 36.1944 46.08 24C46.08 11.8056 36.1944 1.92 24 1.92C11.8056 1.92 1.92 11.8056 1.92 24Z"
                stroke="url(#paint0_linear_4537_9543)"
                strokeWidth="2"
                mask="url(#path-1-inside-1_4537_9543)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_4537_9543"
                  x1="8.79521e-09"
                  y1="25.3846"
                  x2="48"
                  y2="25.3846"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#F6F655" />
                  <stop offset="1" stopColor="#5EED87" />
                </linearGradient>
              </defs>
            </motion.svg>
          )}
        </AnimatePresence>

        <div
          className={cn(
            'bg-accent/30 absolute inset-0 flex items-center justify-center rounded-full backdrop-blur-[1px]',
            isFailed && 'bg-accent'
          )}
          style={{
            boxShadow: '0px 0px 4px 0px rgba(255, 255, 255, 0.10) inset'
          }}
        >
          {isCompleted ? (
            <Icon className="absolute size-4.5" icon="LockOpen" />
          ) : (
            <Icon className="absolute size-4.5" icon="Lock" />
          )}
        </div>
      </div>
    </div>
  )
}

export default RewardLock
