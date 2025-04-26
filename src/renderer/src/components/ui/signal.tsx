import { cn } from '@/utils/tw'
import { cva, type VariantProps } from 'class-variance-authority'

const signalVariants = cva('size-6 relative', {
  variants: {
    variant: {
      positive: 'text-positive',
      negative: 'text-destructive',
      warning: 'text-warning'
    }
  },
  defaultVariants: {
    variant: 'positive'
  }
})

interface SignalProps
  extends Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof signalVariants> {}

const Signal = ({ className, variant, ...props }: SignalProps) => {
  return (
    <div className={cn(signalVariants({ variant: variant, className }))} {...props}>
      <div className="outer size-full rounded-full bg-current opacity-5" />
      <div className="inner absolute top-1/2 left-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
    </div>
  )
}

export default Signal
