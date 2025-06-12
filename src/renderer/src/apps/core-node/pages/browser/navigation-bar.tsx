import { Icon } from '@/components/ui/icon'
import { InputCustomize } from '@/components/ui/input'

const NavigationBar = () => {
  return (
    <div className="rounded-tl-24 flex h-18 w-full items-center gap-8 border-t border-l border-white/10 px-8 py-3">
      <div className="flex items-center gap-6 text-white">
        <Icon icon="ArrowLeft" className="size-6" />
        <Icon icon="ArrowRight" className="size-6" />
        <Icon icon="RotateCcw" className="size-6" />
      </div>
      <InputCustomize className="flex-1" startIcon={<Icon icon="Search" className="size-6" />} />
    </div>
  )
}

export default NavigationBar
