import { cn } from '@/utils/tw'
import { ButtonHTMLAttributes } from 'react'

interface ControlButton extends ButtonHTMLAttributes<HTMLButtonElement> {}

const ControlButton = ({ className, children, ...props }: ControlButton) => {
  return (
    <button
      className={cn(
        'flex size-6 cursor-pointer items-center justify-center transition-opacity hover:opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default ControlButton
