import { cn } from '@/utils/tw'
import { ButtonHTMLAttributes } from 'react'

interface ControlButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

const ControlButton = ({ className, label, ...props }: ControlButton) => {
  return (
    <button className={cn(className)} {...props}>
      {label}
    </button>
  )
}

export default ControlButton
