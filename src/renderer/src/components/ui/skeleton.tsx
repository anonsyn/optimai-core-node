import { cn } from '@/utils/tw'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-secondary animate-pulse rounded-md', className)} {...props} />
}

export { Skeleton }
