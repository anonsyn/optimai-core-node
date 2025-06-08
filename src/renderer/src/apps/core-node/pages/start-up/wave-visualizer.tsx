import { cn } from '@/utils/tw'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

const WaveVisualizer = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Animation configuration variables
  const BASE_DELAY = 0.5
  const DURATION = 0.4
  const STAGGER_DELAY = 0.2
  const REPEAT_DELAY = 0.12

  useGSAP(
    () => {
      // Animate each pair independently with yoyo effect
      gsap.to('.wave-bar__0, .wave-bar__5', {
        height: 12,
        opacity: 0.2,
        duration: DURATION,
        ease: 'power1.inOut',
        delay: BASE_DELAY,
        repeat: -1,
        yoyo: true,
        repeatDelay: REPEAT_DELAY
      })

      gsap.to('.wave-bar__1, .wave-bar__4', {
        height: 16,
        opacity: 0.5,
        duration: DURATION,
        ease: 'power1.inOut',
        delay: BASE_DELAY + STAGGER_DELAY,
        repeat: -1,
        yoyo: true,
        repeatDelay: REPEAT_DELAY
      })

      gsap.to('.wave-bar__2, .wave-bar__3', {
        height: 20,
        opacity: 1,
        duration: DURATION,
        ease: 'power1.inOut',
        delay: BASE_DELAY + STAGGER_DELAY * 1.2,
        repeat: -1,
        yoyo: true,
        repeatDelay: REPEAT_DELAY
      })
    },
    {
      scope: containerRef
    }
  )

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className={cn(
            'wave-bar bg-main w-1.5 rounded-t-lg opacity-0',
            `wave-bar__${index}`
            // index === 0 || index === 5 ? 'h-3' : index === 1 || index === 4 ? 'h-4' : 'h-5'
          )}
        />
      ))}
    </div>
  )
}

export default WaveVisualizer
