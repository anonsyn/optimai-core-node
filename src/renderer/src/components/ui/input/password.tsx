import { Icon } from '@/components/ui/icon'
import { InputCustomize } from '@/components/ui/input/wrapper'
import React, { useState } from 'react'

export interface PasswordProps extends React.ComponentPropsWithoutRef<typeof InputCustomize> {}

const Password = React.forwardRef<HTMLInputElement, PasswordProps>(({ ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <InputCustomize
      {...props}
      type={showPassword ? 'text' : 'password'}
      ref={ref}
      endIcon={
        <button
          className="text-foreground size-6 transition-opacity hover:opacity-50"
          tabIndex={-1}
          type="button"
          onClick={togglePassword}
        >
          <Icon className="size-6" icon={showPassword ? 'Eye' : 'EyeOff'} />
        </button>
      }
    />
  )
})

Password.displayName = 'Password'

export { Password }
