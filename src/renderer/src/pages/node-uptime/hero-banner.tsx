import nodeUptimeLottieData from '@/assets/lotties/node-uptime'
import Lottie from 'lottie-react'

const HeroBanner = () => {
  return (
    <div className="box-content h-[9rem] w-full pb-12">
      <div className="relative h-full w-full">
        <Lottie
          className="absolute top-1/2 left-1/2 size-[18.75rem] -translate-x-1/2 -translate-y-1/2"
          animationData={nodeUptimeLottieData}
          loop
        />
      </div>
    </div>
  )
}

export default HeroBanner
