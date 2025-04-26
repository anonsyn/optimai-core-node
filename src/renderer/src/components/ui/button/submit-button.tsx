import { Button } from '@/components/ui/button/button'
import Spinner from '@/components/ui/spinner'
import { cn } from '@/utils/tw'
import cx from 'clsx'
import React, { ReactNode } from 'react'

type SubmitButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  loading?: boolean
  icon?: ReactNode
}

const SubmitButton = ({
  className,
  loading,
  icon,
  children,
  disabled,
  ...props
}: SubmitButtonProps) => {
  return (
    <Button
      className={cx('relative', { loading: loading }, className)}
      disabled={loading || disabled}
      type="submit"
      {...props}
    >
      {icon ? (
        <>
          <div className="relative">
            <span className={cn('block', loading && 'opacity-0')}>{icon}</span>
            {loading && (
              <Spinner className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
          {children}
        </>
      ) : (
        <>
          <span className={cn('block transition-opacity', loading && 'opacity-0')}>{children}</span>
          {loading && (
            <Spinner className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2" />
          )}
        </>
      )}
    </Button>
  )
}

export { SubmitButton }
