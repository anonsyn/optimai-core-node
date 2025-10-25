import { HelpMenuContent } from '@/components/help-menu'
import { IconButton } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'

const HelpFloatingMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton className="absolute right-5 bottom-5 z-50 size-10 rounded-lg">
          <Icon className="size-4.5" icon="QuestionMark" />
        </IconButton>
      </DropdownMenuTrigger>
      <HelpMenuContent />
    </DropdownMenu>
  )
}

export default HelpFloatingMenu
