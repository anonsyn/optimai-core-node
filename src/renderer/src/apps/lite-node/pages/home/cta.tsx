import { Button } from '@/components/ui/button'
import { EXTERNAL_LINKS } from '@lite-node/routers/paths'

const CTA = () => {
  const handleClick = () => {
    window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.HOME)
  }

  return (
    <Button
      className="text-14 mt-2 mb-3.5 w-[278px] rounded-lg font-semibold"
      size="sm"
      onClick={handleClick}
    >
      Go to Dashboard
    </Button>
  )
}

export default CTA
