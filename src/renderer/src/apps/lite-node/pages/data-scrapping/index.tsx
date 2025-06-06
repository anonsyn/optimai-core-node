import { useHeader } from '@/hooks/use-header'
import { PATHS } from '@lite-node/routers/paths'
import HeroBanner from './hero-banner'
import Overview from './overview'
import Tasks from './tasks'

const DataScrappingPage = () => {
  useHeader({ title: 'Data Scrapping', backPath: PATHS.DATA_OPERATOR })

  return (
    <div
      className="h-full"
      data-global-glow="true"
      style={{
        maskImage: 'linear-gradient(180deg, #D9D9D9 83%, rgba(115, 115, 115, 0.1) 99%)'
      }}
    >
      <div className="h-full w-full overflow-y-auto" id="data-scrapping">
        <HeroBanner />
        <div className="rounded-t-button bg-raydial-05 relative min-h-[calc(100%-252px)] w-full pb-5 backdrop-blur-[20px]">
          <div className="space-y-3">
            <Overview />
            <Tasks />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataScrappingPage
