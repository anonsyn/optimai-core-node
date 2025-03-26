import IMAGES from '@/configs/images'
import { cn } from '@/utils/tw'
import { ImgHTMLAttributes } from 'react'

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {}

const Logo = ({ className }: LogoProps) => {
  return (
    <img
      className={cn('max-h-none w-auto max-w-none', className)}
      src={IMAGES.BRANDING.CORE_NODE_LOGO}
      alt="logo"
    />
  )
}

export default Logo
