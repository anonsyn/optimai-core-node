import { cn } from '@/utils/tw'
import { VariantProps, cva } from 'class-variance-authority'

const indicatorVariants = cva('flex gap-2.5 items-center', {
  variants: {
    variant: {
      not_started: 'text-white',
      in_progress: 'text-warning',
      completed: 'text-positive',
      failed: 'text-destructive'
    }
  },
  defaultVariants: {
    variant: 'completed'
  }
})

export interface IndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof indicatorVariants> {}

const statusMapping = {
  not_started: 'Pending',
  in_progress: 'Processing',
  completed: 'Completed',
  failed: 'Failed'
}

const StatusIndicator = ({ className, variant = 'completed', ...props }: IndicatorProps) => {
  const statusLabel = variant && statusMapping[variant]

  if (!statusLabel) {
    return null
  }
  return (
    <div className={cn(indicatorVariants({ variant, className }))} {...props}>
      <div className="relative flex size-4 items-center justify-center overflow-hidden rounded-full">
        <div className="absolute size-full rounded-full bg-current opacity-10" />
        <div
          className={cn(
            'absolute size-[5.333px] rounded-full bg-current',
            variant === 'not_started' && 'opacity-50'
          )}
        />
      </div>
      <span
        className={cn(
          'text-16 leading-normal font-medium text-current',
          variant === 'not_started' && 'opacity-80'
        )}
      >
        {statusLabel}
      </span>
    </div>
  )
}

export default StatusIndicator
