import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { EXTERNAL_LINKS } from '@/configs/links'
import { useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { Bug, MessageCircleQuestionMark, Signpost } from 'lucide-react'

interface HelpMenuContentProps {
  className?: string
  onItemClick?: () => void
}

const HelpMenuContent = ({ className, onItemClick }: HelpMenuContentProps) => {
  const openReportIssueModal = useOpenModal(Modals.REPORT_ISSUE)
  return (
    <DropdownMenuContent className={cn('w-[224px] bg-[#2B2F2D]', className)}>
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            onItemClick?.()
          }}
        >
          <Signpost className="size-4" />
          <span>Installation Tutorial</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup
        onClick={() => {
          window.windowIPC.openExternalLink(EXTERNAL_LINKS.SOCIALS.DISCORD)
          onItemClick?.()
        }}
      >
        <DropdownMenuItem>
          <MessageCircleQuestionMark />
          <span>Ask Community</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            openReportIssueModal()
            onItemClick?.()
          }}
        >
          <Bug />
          <span>Report Issue</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}

export { HelpMenuContent }
