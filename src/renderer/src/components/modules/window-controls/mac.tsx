import { Icon, Icons } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { cva, VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'flex items-center justify-center size-3 disabled:bg-[#5C5D5B] disabled:pointer-events-none text-black/60 rounded-full',
  {
    variants: {
      variant: {
        close: 'bg-[#FF5F57] order-1',
        minimize: 'bg-[#FEBC2E] order-2',
        maximize: 'bg-[#28C840] order-3'
      }
    }
  }
)

interface MacControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

const MacControls = ({ className, ...props }: MacControlsProps) => {
  return (
    <div className={cn('group/controls flex items-center gap-2 py-px', className)} {...props}></div>
  )
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    NonNullable<VariantProps<typeof buttonVariants>> {}

const MacControlButton = ({ variant, className, disabled, ...props }: ButtonProps) => {
  const icons = {
    close: Icons.X,
    minimize: Icons.Minus,
    maximize: Icons.Plus
  }
  return (
    <button className={cn(buttonVariants({ variant, className }))} disabled={disabled} {...props}>
      <Icon
        className={cn(
          'size-2.5 opacity-0',
          !disabled && 'group-hover/controls:opacity-100 hover:opacity-100'
        )}
        strokeWidth={3}
        icon={icons[variant || 'close']}
      />
    </button>
  )
}

export { MacControlButton, MacControls }
