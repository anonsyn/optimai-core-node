import { cn } from '@/utils/tw'
import { HTMLMotionProps, motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  className?: string
  gradient?: boolean
}

export const Card = ({ children, className, gradient = false, ...motionProps }: CardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/5 p-4 backdrop-blur-sm',
        gradient ? 'bg-gradient-to-br from-white/[0.03] to-white/[0.01]' : 'bg-white/[0.02]',
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

interface CardHeaderProps {
  icon: ReactNode
  title: string
  className?: string
}

export const CardHeader = ({ icon, title, className }: CardHeaderProps) => {
  return (
    <div className={cn('mb-3 flex items-center gap-2', className)}>
      {icon}
      <span className="text-12 text-white">{title}</span>
    </div>
  )
}
