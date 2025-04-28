import dataScrappingLottieData from '@/assets/lotties/data-scrapping'
import ComingSoon from '@/components/svgs/coming-soon'
import {
  Feature,
  FeatureBanner,
  FeatureContent,
  FeatureDescription,
  FeatureTitle
} from '@/components/ui/card'
import { PATHS } from '@/routers/paths'
import { cn } from '@/utils/tw'
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router'

const Features = () => {
  const navigate = useNavigate()

  const features = [
    {
      title: 'Data Scraping',
      description: 'Collect data to build large-scale datasets',
      href: PATHS.DATA_SCRAPPING,
      banner: (
        <Lottie
          className="absolute top-1/2 left-1/2 size-[390px] -translate-x-1/2 -translate-y-1/2 sm:size-[420px] md:size-[500px]"
          animationData={dataScrappingLottieData}
          loop
        />
      )
    },
    {
      title: 'Data Cleaning',
      description: 'Remove duplicates, fix errors,...',
      disabled: true,
      banner: (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ComingSoon />
        </div>
      )
    },
    {
      title: 'Data Validation',
      description: 'Ensure data accuracy by validating for errors',
      disabled: true,
      banner: (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ComingSoon />
        </div>
      )
    },
    {
      title: 'Data Annotation',
      description: 'Create structured datasets for AI training',
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
