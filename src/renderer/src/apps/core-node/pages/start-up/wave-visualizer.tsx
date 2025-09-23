import { cn } from '@/utils/tw'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useEffect } from 'react'
import { StartupPhase } from './provider'

interface WaveVisualizerProps {
  phase?: StartupPhase
  className?: string
}

const WaveVisualizer = ({ phase, className }: WaveVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Phase-specific animation configs
  const getAnimationConfig = (phase?: StartupPhase) => {
    switch (phase) {
      case StartupPhase.INITIALIZING:
        return { duration: 0.6, stagger: 0.15, maxHeight: 24 }
      case StartupPhase.CHECKING_UPDATES:
        return { duration: 0.5, stagger: 0.1, maxHeight: 20 }
      case StartupPhase.CHECKING_DOCKER:
        return { duration: 0.4, stagger: 0.08, maxHeight: 28 }
      case StartupPhase.CHECKING_AUTH:
        return { duration: 0.45, stagger: 0.12, maxHeight: 22 }
      case StartupPhase.STARTING_NODE:
        return { duration: 0.55, stagger: 0.2, maxHeight: 18 }
      case StartupPhase.COMPLETED:
        return { duration: 0.3, stagger: 0.05, maxHeight: 32 }
      default:
        return { duration: 0.4, stagger: 0.15, maxHeight: 20 }
    }
  }

  useGSAP(
    () => {
      const config = getAnimationConfig(phase)

      // Create timeline for coordinated animations
      timelineRef.current = gsap.timeline({ repeat: -1 })

      // Animate bars with phase-specific patterns
      for (let i = 0; i < 8; i++) {
        const heightMultiplier = i < 4 ? (i + 1) / 4 : (8 - i) / 4
        const targetHeight = config.maxHeight * heightMultiplier

        timelineRef.current.to(
          `.wave-bar__${i}`,
          {
            height: targetHeight,
            opacity: 0.3 + heightMultiplier * 0.7,
            duration: config.duration,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: 1
          },
          i * config.stagger
        )
      }
    },
    {
      scope: containerRef,
      dependencies: [phase]
    }
  )

  // Update animation when phase changes
  useEffect(() => {
    if (timelineRef.current) {
      const config = getAnimationConfig(phase)
      timelineRef.current.timeScale(1 / config.duration)
    }
  }, [phase])

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-1.5',
        className
      )}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className={cn(
            'wave-bar from-yellow to-green w-1 rounded-t-full bg-gradient-to-t opacity-0',
            `wave-bar__${index}`
          )}
          style={{ height: '2px' }}
        />
      ))}
    </div>
  )
}

export default WaveVisualizer
