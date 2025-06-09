import IMAGES from '@/configs/images'
import { cn } from '@/utils/tw'
import { ImgHTMLAttributes } from 'react'

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'horizontal' | 'vertical'
}

const Logo = ({ className, variant = 'vertical', ...props }: LogoProps) => {
  return (
    <img
      className={cn('max-h-none w-auto max-w-none', className)}
      src={
        variant === 'horizontal'
          ? IMAGES.BRANDING.CORE_NODE_LOGO_HORIZONTAL
          : IMAGES.BRANDING.CORE_NODE_LOGO
      }
      alt="logo"
      {...props}
    />
  )
}

export default Logo
