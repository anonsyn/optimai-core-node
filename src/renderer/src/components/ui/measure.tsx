import { cn } from '@/utils/tw'

const StatsMeasure = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <p className={cn('flex items-baseline gap-1.5', className)} {...props} />
}

const StatsValue = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('text-36 text-foreground inline-block leading-none font-medium', className)}
      {...props}
    />
  )
}

const StatsUnit = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'text-16 text-muted-foreground inline-block leading-none font-medium',
        className
      )}
      {...props}
    />
  )
}

export { StatsMeasure, StatsUnit, StatsValue }
