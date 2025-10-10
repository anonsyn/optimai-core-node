import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/tw'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-10 text-14 leading-5 font-semibold  transition-all outline-none outline-1 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'shadow-button bg-main text-primary-foreground hover:bg-button-gradient-hover',
        secondary: 'border border-[#3E5033] bg-secondary-button hover:bg-secondary-button-hover',
        outline:
          'border border-foreground/10 bg-accent/10 shadow-button-outline hover:bg-accent/40 text-foreground',
        ghost: 'bg-transparent hover:bg-accent/50',
        link: 'text-foreground outline-offset-4 hover:underline',
        destructive:
          'bg-destructive/2 border border-destructive text-destructive-foreground bg-destructive/10',
        opacity: 'transition-opacity hover:opacity-60'
      },
      size: {
        default: 'min-h-11 px-5',
        sm: 'min-h-10 rounded-lg px-3',
        lg: 'min-h-12 rounded-xl px-8'
      },
      icon: {
        true: 'p-0 min-h-0',
        false: null
      }
    },
    compoundVariants: [
      {
        size: 'default',
        icon: true,
        class: 'size-11'
      },
      {
        size: 'sm',
        icon: true,
        class: 'size-10'
      },
      {
        size: 'lg',
        icon: true,
        class: 'size-12'
      }
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      icon: false
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, icon, className }))}
        ref={ref}
        type="button"
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

const SecondaryText = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('bg-main webkit-text-clip block bg-clip-text', className)} {...props}>
      {children}
    </span>
  )
}

export { Button, buttonVariants, SecondaryText }
