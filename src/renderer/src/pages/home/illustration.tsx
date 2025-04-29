import { homeNodeActiveLottieData } from '@/assets/lotties/active-node'
import { homeNodeDisableLottieData } from '@/assets/lotties/disable-node'
import { useAppSelector } from '@/hooks/redux'
import { onlineSelectors } from '@/store/slices/online'
import { cn } from '@/utils/tw'
import { useIsomorphicLayoutEffect } from 'framer-motion'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { useEffect, useRef, useState } from 'react'

const Illustration = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(() => {
    const savedScale = localStorage.getItem('tapV2Scale')
    return savedScale ? parseFloat(savedScale) : 0.85
  })

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const { height } = container.getBoundingClientRect()
      const newScale = Math.min(Math.max(height / 300, 0.4), 0.85)
      setScale(newScale)
      // Save scale to localStorage
      localStorage.setItem('tapV2Scale', newScale.toString())
    }

    const resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const isOnline = useAppSelector(onlineSelectors.isOnline)
  const activeLottieRef = useRef<LottieRefCurrentProps>(null)
  const disableLottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (activeLottieRef.current && disableLottieRef.current) {
      const activeLottie = activeLottieRef.current
      const disableLottie = disableLottieRef.current
      if (isOnline) {
        activeLottie.play()
        disableLottie.stop()
      } else {
        activeLottie.stop()
        disableLottie.play()
      }
    }
  }, [isOnline])

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 z-1 size-[300px] origin-center -translate-x-1/2 -translate-y-1/2'
        )}
        style={{
          scale
        }}
      >
        <div>
          <div
            className="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              border: '1px solid rgba(209, 209, 209, 0.02)',
              background: 'rgba(36, 41, 38, 0.05)'
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              border: '1px solid rgba(209, 209, 209, 0.02)',
              background: 'rgba(36, 41, 38, 0.05)'
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              border: '1px solid rgba(209, 209, 209, 0.02)',
              // background: "rgba(36, 41, 38, 0.05)",
              maskRepeat: 'no-repeat',
              maskImage:
                'radial-gradient(circle, black 50%, transparent 51%), linear-gradient(black, black)',
              maskComposite: 'exclude',
              maskPosition: '50% 50%, 0 0',
              maskSize: '416px 416px, 100% 100%'
            }}
          >
            <div
              className="absolute h-0.5 w-full bg-[#2E312E]"
              style={{
                top: '236px',
                backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
              }}
            />
            <div
              className="absolute h-0.5 w-full bg-[#2E312E]"
              style={{
                top: '299px',
                backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
              }}
            />
            <div
              className="absolute h-0.5 w-full bg-[#2E312E]"
              style={{
                top: '361px',
                backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
              }}
            />
          </div>

          <Lottie
            className={cn(
              'absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
              !isOnline && 'opacity-0'
            )}
            lottieRef={activeLottieRef}
            animationData={homeNodeActiveLottieData}
            loop
          />
          <Lottie
            className={cn(
              'absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
              isOnline && 'opacity-0'
            )}
            lottieRef={disableLottieRef}
            animationData={homeNodeDisableLottieData}
            loop
          />
        </div>
      </div>
    </div>
  )
}

export default Illustration
