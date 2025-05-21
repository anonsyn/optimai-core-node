import { Icon, Icons } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { cva, VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'flex items-center justify-center size-3 disabled:pointer-events-none text-black/40',
  {
    variants: {
      variant: {
        minimize: 'order-1',
        maximize: 'order-2',
        close: 'order-3'
      }
    }
  }
)

interface WindowsControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

const WindowsControls = ({ className, ...props }: WindowsControlsProps) => {
  return <div className={cn('flex items-center gap-2', className)} {...props}></div>
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    NonNullable<VariantProps<typeof buttonVariants>> {}

const WindowsControlButton = ({ variant, className, disabled, ...props }: ButtonProps) => {
  const icons = {
    close: Icons.X,
    minimize: Icons.Minus,
    maximize: Icons.Plus
  }
  return (
    <button className={cn(buttonVariants({ variant, className }))} disabled={disabled} {...props}>
      <Icon
        className={cn('size-2 opacity-0', !disabled && 'group-hover/mac-controls:opacity-100')}
        icon={icons[variant || 'close']}
      />
    </button>
  )
}

export { WindowsControlButton, WindowsControls }
