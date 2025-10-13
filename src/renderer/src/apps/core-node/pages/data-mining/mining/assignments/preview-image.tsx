import IMAGES from '@/configs/images'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

interface PreviewImageProps {
  src?: string
}

const PreviewImage = ({ src }: PreviewImageProps) => {
  return (
    <Avatar className="bg-background/50 h-36 w-64 flex-shrink-0 overflow-hidden rounded-lg">
      <AvatarImage src={src} className="h-full w-full object-cover" />
      <AvatarFallback>
        <div className="flex size-full items-center justify-center">
          <img src={IMAGES.SITE_PLACEHOLDER} alt="" className="h-18 object-cover" />
        </div>
      </AvatarFallback>
    </Avatar>
  )
}

export default PreviewImage
