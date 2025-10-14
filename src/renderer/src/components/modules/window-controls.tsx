import { Icon, Icons } from '@/components/ui/icon'
import { getOS, OS } from '@/utils/os'
import { cn } from '@/utils/tw'
import { cva, VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  'flex items-center justify-center transition-colors duration-200 group rounded-md disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        minimize: 'hover:bg-white/10',
        maximize: 'hover:bg-white/10',
        close: 'hover:bg-destructive/10'
      },
      size: {
        default: 'h-10 w-12'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

interface WindowControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const WindowControls = ({ className, children, ...props }: WindowControlsProps) => {
  const os = getOS()

  // Only show controls on Windows and Linux
  if (os === OS.MAC) {
    return null
  }

  return (
    <div
      className={cn('no-drag absolute top-0 right-0 z-50 flex items-center', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface WindowControlButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onDrag' | 'onDragEnd' | 'onDragStart'
    >,
    VariantProps<typeof buttonVariants> {
  variant: 'minimize' | 'maximize' | 'close'
}

const WindowControlButton = ({
  variant,
  className,
  disabled,
  onClick
}: WindowControlButtonProps) => {
  const icons = {
    close: Icons.X,
    minimize: Icons.Minus,
    maximize: Icons.Square
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    } else {
      // Default behaviors
      switch (variant) {
        case 'close':
          window.windowIPC.close()
          break
        case 'minimize':
          window.windowIPC.minimize()
          break
        case 'maximize':
          window.windowIPC.maximize()
          break
      }
    }
  }

  return (
    <motion.button
      className={cn(buttonVariants({ variant, size: 'default', className }))}
      disabled={disabled}
      onClick={handleClick}
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon
        className={cn(
          'size-4.5',
          'text-white/80',
          'transition-colors duration-200',
          disabled && 'text-white/50',
          variant === 'close' ? 'group-hover:text-destructive' : 'group-hover:text-white'
        )}
        icon={icons[variant]}
        strokeWidth={2}
      />
    </motion.button>
  )
}

export { WindowControlButton, WindowControls }
