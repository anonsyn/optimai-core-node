import { cn } from '@/utils/tw'
import { HTMLAttributes } from 'react'

interface TopBarProps extends HTMLAttributes<HTMLDivElement> {}

const TopBar = ({ className, ...props }: TopBarProps) => {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)} {...props}>
      <div className="top-bar__decorator flex h-0.5 items-center gap-6 opacity-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn('h-full rounded-lg bg-white/4', index === 1 ? 'flex-1' : 'w-18')}
          />
        ))}
      </div>
      <div className="relative flex h-11 w-full items-center justify-center">
        <div className="top-bar__background absolute top-1/2 left-1/2 h-full w-0 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/5" />
        <p className="top-bar__text text-22 leading-tight text-white/50">
          Powered by <span className="font-actual text-white">OptimAI</span>{' '}
          <span className="text-white">Network</span>
        </p>
      </div>
      <div className="top-bar__decorator flex items-center justify-between opacity-0">
        {Array.from({ length: 3 }).map((_, index) => {
          return (
            <div key={index} className="flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="size-1 shrink-0 rounded-full bg-white/10" />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopBar
