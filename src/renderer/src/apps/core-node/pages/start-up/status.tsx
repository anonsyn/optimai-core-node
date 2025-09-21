import { cn } from '@/utils/tw'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { HTMLAttributes } from 'react'
import { useStartup } from './provider'

interface StatusProps extends HTMLAttributes<HTMLDivElement> {}

const Status = ({ className, ...props }: StatusProps) => {
  const { statuses, error, canRetry, retry } = useStartup()
  const [listRef] = useAutoAnimate()

  return (
    <div className={cn('relative h-full w-full overflow-visible', className)} {...props}>
      <div
        ref={listRef}
        className="absolute inset-x-0 bottom-0 flex h-[108px] w-full flex-col justify-end overflow-visible"
        style={{
          maskImage: 'linear-gradient(180deg, rgba(217, 217, 217, 0.00) 0%, #737373 100%)'
        }}
      >
        {statuses.map((status, index) => (
          <p
            key={`${status.message}-${index}`}
            className={cn(
              'text-24 shrink-0 text-center leading-normal font-medium text-white',
              status.error && 'text-destructive'
            )}
            style={{
              textShadow: '0px 0px 12px rgba(255, 255, 255, 0.30)'
            }}
          >{`> ${status.message}`}</p>
        ))}
      </div>

      {/* Error state with retry button */}
      {canRetry && error && (
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4">
          <p className="text-center text-white opacity-80">{error}</p>
          <button
            onClick={retry}
            className="rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default Status