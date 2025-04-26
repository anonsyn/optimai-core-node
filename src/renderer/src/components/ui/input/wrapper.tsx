import { Input } from '@/components/ui/input'
import { cn } from '@/utils/tw'
import React, { ReactNode, forwardRef } from 'react'

interface InputWrapperProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  startIcon?: ReactNode
  endIcon?: ReactNode
  inputClassName?: string
  startIconWrapperClassName?: string
  endIconWrapperClassName?: string
  containerOptions?: Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>
}

const InputCustomize = forwardRef<HTMLInputElement, InputWrapperProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      containerOptions,
      inputClassName,
      startIconWrapperClassName,
      endIconWrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', className)} {...containerOptions}>
        {startIcon && (
          <div
            className={cn(
              'absolute top-1/2 left-4 flex h-full -translate-y-1/2 items-center justify-center gap-2',
              startIconWrapperClassName
            )}
          >
            {startIcon}
          </div>
        )}
        <Input
          className={cn(startIcon && 'pl-12', endIcon && 'pr-12', inputClassName)}
          {...props}
          ref={ref}
        />
        {endIcon && (
          <div
            className={cn(
              'absolute top-1/2 right-4 flex h-full -translate-y-1/2 items-center justify-center gap-2',
              endIconWrapperClassName
            )}
          >
            {endIcon}
          </div>
        )}
      </div>
    )
  }
)

InputCustomize.displayName = 'InputCustomize'

export { InputCustomize }
