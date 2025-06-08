import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useCloseModal, useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { useEffect, useRef, useState } from 'react'

const OnBoardingModal = () => {
  const open = useIsModalOpen(Modals.ON_BOARDING)
  const closeModal = useCloseModal(Modals.ON_BOARDING)
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="bg-background/80 h-full w-full">
        <OnBoardingContent />
      </DialogContent>
    </Dialog>
  )
}

const getVideoSource = (path: string) => {
  return `https://r2-opi-lp.optimai.network/lite-node${path}`
}

const OnBoardingContent = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  const stages = [
    {
      title: 'Run Your Node, Earn Passive Income',
      desc: 'Let your node operate in the background, support the OptimAI Network, and earn rewards',
      sources: [
        {
          src: getVideoSource('/videos/tutorial-1.mp4'),
          type: 'video/mp4'
        },
        {
          src: getVideoSource('/videos/tutorial-1.webm'),
          type: 'video/webm'
        }
      ]
    },
    {
      title: 'Complete Missions, Get Rewarded ',
      desc: 'Complete tasks, support the network, and earn more rewards with ease!',
      sources: [
        {
          src: getVideoSource('/videos/tutorial-2.mp4'),
          type: 'video/mp4'
        },
        {
          src: getVideoSource('/videos/tutorial-2.webm'),
          type: 'video/webm'
        }
      ]
    },
    {
      title: 'Invite Friends, Grow Network & Earn!',
      desc: 'Help expand the OptimAI Network and enjoy extra rewards for every referral!',
      sources: [
        {
          src: getVideoSource('/videos/tutorial-3.mp4'),
          type: 'video/mp4'
        },
        {
          src: getVideoSource('/videos/tutorial-3.webm'),
          type: 'video/webm'
        }
      ]
    }
  ]

  const handleVideoEnd = () => {
    setActiveIndex(activeIndex < stages.length - 1 ? activeIndex + 1 : 0)
  }
  const closeModal = useCloseModal(Modals.ON_BOARDING)

  const handleClose = () => {
    closeModal()
  }

  useEffect(() => {
    if (!api) {
      return
    }

    setActiveIndex(api.selectedScrollSnap())

    api.on('select', () => {
      setActiveIndex(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div className="size-full">
      <Carousel className="size-full" setApi={setApi}>
        <CarouselContent className="h-full">
          {stages.map((item, index) => {
            return (
              <Item
                key={index}
                item={item}
                index={index}
                activeIndex={activeIndex}
                totalItems={stages.length}
                api={api}
                onVideoEnd={handleVideoEnd}
              />
            )
          })}
        </CarouselContent>
      </Carousel>
      <button
        className="no-drag absolute top-3 right-3 flex size-10 items-center justify-center transition-opacity hover:opacity-60"
        onClick={handleClose}
      >
        <Icon icon="X" className="size-6" />
      </button>
    </div>
  )
}

const Item = ({
  item,
  index,
  activeIndex,
  totalItems,
  api,
  onVideoEnd
}: {
  item: {
    title: string
    desc: string
    sources: {
      src: string
      type: string
    }[]
  }
  index: number
  activeIndex: number
  totalItems: number
  api: CarouselApi
  onVideoEnd: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const isActive = index === activeIndex

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    if (isActive) {
      video.currentTime = 0
      video.play()

      const handlePlayEnd = () => {
        const nextIndex = index < totalItems - 1 ? index + 1 : 0
        api?.scrollTo(nextIndex)
        video.currentTime = 0
      }

      video.addEventListener('ended', handlePlayEnd)

      return () => {
        video.removeEventListener('ended', handlePlayEnd)
      }
    } else {
      video.pause()
      video.currentTime = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <CarouselItem className="basis-full">
      <div className="grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] items-center gap-5 px-6 pt-13 pb-8 select-none">
        <div className="relative flex h-full w-full flex-col items-center">
          <video
            key={index}
            ref={videoRef}
            className={cn('rounded-20 h-full w-auto')}
            autoPlay={false}
            muted
            playsInline
            onEnded={onVideoEnd}
          >
            {item.sources.map((source) => {
              return <source key={source.src} src={source.src} type={source.type} />
            })}
          </video>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalItems }).map((_, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    'size-1.5 rounded-full bg-[#D9D9D9] opacity-50 transition-opacity',
                    activeIndex === index && 'opacity-100'
                  )}
                />
              )
            })}
          </div>
          <p className="text-16 text-foreground mt-6 leading-relaxed font-semibold">{item.title}</p>
          <p className="text-14 text-center leading-relaxed text-balance text-white/80">
            {item.desc}
          </p>
        </div>
      </div>
    </CarouselItem>
  )
}

export default OnBoardingModal
