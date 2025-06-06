import { cn } from '@/utils/tw'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

interface NavButtonProps
  extends Omit<
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'children'
  > {
  icon: React.ReactNode
  activeIcon: React.ReactNode
  active?: boolean
  notification?: number
}

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>((props, ref) => {
  const { className, icon, activeIcon, active, notification, ...rest } = props

  return (
    <button
      className={cn(
        'text-foreground/50 relative flex size-13 items-center justify-center overflow-visible rounded-full bg-transparent transition-colors',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-white after:opacity-0 after:transition-opacity hover:after:opacity-10 active:after:opacity-5',
        active && 'backdrop-blur-xln text-mute bg-white/4',
        className
      )}
      ref={ref}
      {...rest}
    >
      <AnimatePresence>
        {notification && !active && (
          <motion.span
            initial={{ opacity: 0, scale: 0.2, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, y: 2 }}
            className="text-10 absolute top-0 right-0 z-10 flex size-5 items-center justify-center rounded-full bg-[rgba(241,65,88,0.50)] leading-normal font-medium tracking-tight text-white backdrop-blur-2xl"
          >
            {notification && <>{notification > 10 ? '9+' : notification}</>}
          </motion.span>
        )}
      </AnimatePresence>
      <span
        className={cn(
          'relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full'
        )}
      >
        <span
          className={cn(
            'bg-main shadow-nav-button-active absolute inset-0 opacity-0 transition-opacity',
            active && 'opacity-100'
          )}
        />
        <span
          className={cn(
            'relative flex size-10 items-center justify-center rounded-full',
            active && 'bg-secondary'
          )}
        >
          {active ? activeIcon : icon}
        </span>
      </span>
    </button>
  )
})

NavButton.displayName = 'NavButton'

export default NavButton
