import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'

interface DomainProps {
  sourceUrl?: string
  favicon?: string
}
const Domain = ({ sourceUrl, favicon }: DomainProps) => {
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  if (!sourceUrl) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-4.5 rounded-none bg-transparent p-0">
        <AvatarImage className="rounded-full" src={favicon} alt="" />
        <AvatarFallback>
          <Icon className="size-4.5 text-white/50" icon="Globe" />
        </AvatarFallback>
      </Avatar>
      <span className="text-16 leading-normal tracking-[-0.32px] text-white/50">
        {getHostname(sourceUrl)}
      </span>
    </div>
  )
}

export default Domain
