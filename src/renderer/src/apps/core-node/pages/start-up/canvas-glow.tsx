import { cn } from '@/utils/tw'
import { useEffect, useRef } from 'react'
import { StartupPhase } from './provider'

interface CanvasGlowProps {
  className?: string
  phase?: StartupPhase
}

const CanvasGlow = ({ className, phase = StartupPhase.INITIALIZING }: CanvasGlowProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      time += 0.005

      // Subtle animated gradient blobs
      const drawGlow = (x: number, y: number, radius: number, color: string, opacity: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, color.replace('1)', `${opacity})`))
        gradient.addColorStop(1, color.replace('1)', '0)'))

        ctx.fillStyle = gradient
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }

      // Moving glows based on phase
      const offset1 = Math.sin(time) * 50
      const offset2 = Math.cos(time * 0.8) * 50

      // Yellow glow - moves slowly
      drawGlow(
        rect.width * 0.2 + offset1,
        rect.height * 0.3 + offset2,
        300,
        'rgba(246, 246, 85, 1)',
        phase === StartupPhase.COMPLETED ? 0.15 : 0.08
      )

      // Green glow - moves opposite
      drawGlow(
        rect.width * 0.8 - offset1,
        rect.height * 0.7 - offset2,
        250,
        'rgba(94, 237, 135, 1)',
        phase === StartupPhase.COMPLETED ? 0.15 : 0.08
      )

      // Center pulse on completion
      if (phase === StartupPhase.COMPLETED) {
        const pulseRadius = 200 + Math.sin(time * 2) * 20
        drawGlow(
          rect.width / 2,
          rect.height / 2,
          pulseRadius,
          'rgba(94, 237, 135, 1)',
          0.1
        )
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase])

  return (
    <div className={cn('absolute inset-0', className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

export default CanvasGlow