import { cn } from '@/utils/tw'
import { VariantProps, cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex p-2 items-center text-14 leading-none font-normal justify-center rounded-md',
  {
    variants: {
      variant: {
        up: 'bg-positive/10 text-positive ',
        unchange: 'bg-accent text-muted-foreground',
        down: 'bg-destructive/5 text-destructive'
      }
    },
    defaultVariants: {
      variant: 'unchange'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, children, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props}>
      {children}
    </div>
  )
}

export { Badge }
