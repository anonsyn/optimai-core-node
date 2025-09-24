import { cn } from '@/utils/tw'
import * as React from 'react'

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm',
      className
    )}
    {...props}
  />
)

const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  // Support both simple text and flex layouts (for title with badges)
  const isFlexContent = React.isValidElement(children) && typeof children.type !== 'string'

  if (isFlexContent) {
    return (
      <div
        className={cn(
          'text-18 flex items-center justify-between font-medium text-white',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <h3 className={cn('text-18 font-medium text-white', className)} {...props}>
      {children}
    </h3>
  )
}

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 pt-2', className)} {...props} />
)

export { Card, CardContent, CardTitle }
