import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'

const Balance = () => {
  return (
    <div className="rounded-10 from-yellow/10 to-green/10 flex h-12 min-w-55 items-stretch overflow-hidden border border-[#415A34] bg-linear-90">
      <div className="rounded-l-10 flex flex-1 items-center gap-2 pr-3 pl-4">
        <Token className="size-6" />
        <p className='shadow-2xl'>
          <span>24,450</span>
          <span>+8.4%</span>
        </p>
      </div>
      <div className="from-yellow to-green flex aspect-square h-full w-auto items-center justify-center bg-linear-90">
        <Icon className="size-6 text-black" icon="PanelRightOpen" />
      </div>
    </div>
  )
}

export default Balance
