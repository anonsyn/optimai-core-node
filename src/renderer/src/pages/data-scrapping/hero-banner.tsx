import dataScrappingLottieData from '@/assets/lotties/data-scrapping'
import Lottie from 'lottie-react'

const HeroBanner = () => {
  return (
    <div className="box-content h-[9rem] w-full pb-12">
      <div className="relative h-full w-full">
        <Lottie
          className="absolute top-1/2 left-1/2 size-[25rem] -translate-x-1/2 -translate-y-1/2"
          animationData={dataScrappingLottieData}
          loop
        />
      </div>
    </div>
  )
}

export default HeroBanner
