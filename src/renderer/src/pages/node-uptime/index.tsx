import { useHeader } from '@/hooks/use-header'
import { PATHS } from '@/routers/paths'
import HeroBanner from './hero-banner'
import Overview from './overview'
import Tasks from './tasks'

const NodeUptimePage = () => {
  useHeader({ title: 'Node Uptime', backPath: PATHS.NODE_OPERATOR })

  return (
    <div
      className="h-full"
      data-global-glow="true"
      style={{
        maskImage: 'linear-gradient(180deg, #D9D9D9 83%, rgba(115, 115, 115, 0.00) 98.5%)'
      }}
    >
      <div className="h-full w-full overflow-y-auto" id="node-uptime">
        <HeroBanner />
        <div className="rounded-t-button bg-raydial-05 relative min-h-[calc(100%-252px)] w-full pb-4 backdrop-blur-[20px]">
          <div className="space-y-3">
            <Overview />
            <Tasks />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodeUptimePage
