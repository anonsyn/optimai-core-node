import { cn } from '@/utils/tw'
import { VariantProps, cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex p-2 items-center text-14 leading-none font-normal justify-center rounded-md',
  {
    variants: {
      variant: {
        success: 'bg-positive/10 text-positive ',
        default: 'bg-accent text-white/50',
        destructive: 'bg-destructive/5 text-destructive'
      },
      text: {
        true: 'bg-transparent p-0'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, children, variant, text, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant, text, className }))} {...props}>
      {children}
    </div>
  )
}

export { Badge }
