import IMAGES from '@/configs/images'
import { cn } from '@/utils/tw'

interface TokenProps extends React.HTMLAttributes<HTMLImageElement> {}

const Token = ({ className, ...props }: TokenProps) => {
  return (
    <img
      className={cn('pointer-events-none max-h-none max-w-none select-none', className)}
      src={IMAGES.BRANDING.TOKEN}
      alt="Token"
      {...props}
    />
  )
}

export default Token
