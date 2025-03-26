import IMAGES from '@/configs/images'
import { cn } from '@/utils/tw'

interface PiProps extends React.HTMLAttributes<HTMLImageElement> {}

const Pi = ({ className, ...props }: PiProps) => {
  return (
    <img
      className={cn('max-h-none w-auto max-w-none', className)}
      src={IMAGES.BRANDING.PI}
      alt="Pi"
      {...props}
    />
  )
}

export default Pi
