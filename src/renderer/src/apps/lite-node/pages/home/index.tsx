import { useHeader } from '@/hooks/use-header'
import CTA from './cta'
import Illustration from './illustration'
import Notification from './notification'

const HomePage = () => {
  useHeader()

  return (
    <div className="h-full w-full overflow-hidden" data-global-glow="true">
      <div className="grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] pt-5">
        <Illustration />
        <div className="relative flex flex-col items-center overflow-hidden pt-4">
          <CTA />
          <Notification />
        </div>
      </div>
    </div>
  )
}

export default HomePage
