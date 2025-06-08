import { cn } from '@/utils/tw'
import { HTMLAttributes } from 'react'

interface RoundedBoxLineProps extends HTMLAttributes<HTMLDivElement> {
  dir?: 'rtl' | 'ltr'
}

const RoundedBoxLine = ({ className, dir = 'rtl', ...props }: RoundedBoxLineProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center opacity-30',
        dir === 'rtl' ? 'flex-row' : 'flex-row-reverse',
        className
      )}
      {...props}
    >
      <div className="size-4 rounded-sm border border-white/50 bg-white/10" />
      <div className="h-px w-16 bg-white/50" />
    </div>
  )
}

export default RoundedBoxLine
