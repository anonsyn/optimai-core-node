import { cn } from '@/utils/tw'
import * as React from 'react'

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'bg-background/40 flex flex-col gap-3 rounded-xl border border-white/4 p-4',
      className
    )}
    {...props}
  />
)

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-18 text-foreground leading-normal font-semibold tracking-tight', className)}
    {...props}
  />
)

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2', className)} {...props} />
)

export { Card, CardContent, CardTitle }
