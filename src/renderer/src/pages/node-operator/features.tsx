import nodeUptimeLottieData from '@/assets/lotties/node-uptime'
import ComingSoon from '@/components/svgs/coming-soon'
import {
  Feature,
  FeatureBanner,
  FeatureContent,
  FeatureDescription,
  FeatureTitle
} from '@/components/ui/ card'

import { PATHS } from '@/routers/paths'
import { cn } from '@/utils/tw'
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router'

const Features = () => {
  const navigate = useNavigate()

  const features = [
    {
      title: 'Node Uptime',
      description: "The longer you're online, the more you earn",
      href: PATHS.NODE_AVAILABILITY,
      banner: (
        <Lottie
          className="absolute top-1/2 left-1/2 size-[390px] -translate-x-1/2 -translate-y-1/2 sm:size-[420px] md:size-[500px]"
          animationData={nodeUptimeLottieData}
          loop
        />
      )
    },
    {
      title: 'Node Compute',
      description: 'Use spare resources for edge and AI tasks ',
      disabled: true,
      banner: (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ComingSoon />
        </div>
      )
    },
    {
      title: 'Node Proxy',
      description: 'Provide proxy services to the network',
      disabled: true,
      banner: (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ComingSoon />
        </div>
      )
    },
    {
      title: 'Node Caching',
      description: 'Boost performance by caching data locally',
      disabled: true,
      banner: (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ComingSoon />
        </div>
      )
    }
  ]

  return (
    <div className="container grid grid-cols-2 gap-2 py-5 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
      {features.map((item, index) => {
        return (
          <Feature
            key={index}
            className={cn(!item.disabled && 'cursor-pointer')}
            disabled={item.disabled}
            onClick={() => {
              if (item.href) {
                navigate(item.href)
              }
            }}
          >
            <FeatureBanner>{item.banner}</FeatureBanner>
            <FeatureContent>
              <FeatureTitle>{item.title}</FeatureTitle>
              <FeatureDescription>{item.description}</FeatureDescription>
            </FeatureContent>
          </Feature>
        )
      })}
    </div>
  )
}

export default Features
