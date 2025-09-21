import { useEffect, useRef, useState } from 'react'

interface CanvasGlowProps {
  className?: string
}

const CanvasGlow = ({ className }: CanvasGlowProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animatedRadius, setAnimatedRadius] = useState(200)
  const [animatedOpacity, setAnimatedOpacity] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Glow configurations
    const glowConfigs = [
      {
        color: { r: 255, g: 231, b: 92 }, // Yellow
        getPosition: (rect: DOMRect) => ({ x: 0, y: rect.height / 2 })
      },
      {
        color: { r: 62, g: 251, b: 175 }, // Green
        getPosition: (rect: DOMRect) => ({ x: rect.width, y: rect.height / 2 })
      }
    ]

    const drawGlow = (
      color: { r: number; g: number; b: number },
      centerX: number,
      centerY: number
    ) => {
      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        animatedRadius * 2
      )

      // Glow with smooth falloff - static gradient with animated opacity
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 * animatedOpacity})`)
      gradient.addColorStop(
        0.1,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.47 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.2,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.43 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.3,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.38 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.4,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.32 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.5,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.25 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.6,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.18 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.7,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.12 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.8,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.07 * animatedOpacity})`
      )
      gradient.addColorStop(
        0.9,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${0.03 * animatedOpacity})`
      )
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      // Apply gradient
      ctx.fillStyle = gradient
      ctx.fillRect(
        centerX - animatedRadius * 2,
        centerY - animatedRadius * 2,
        animatedRadius * 4,
        animatedRadius * 4
      )
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw all glows using the configuration array
      glowConfigs.forEach((config) => {
        const position = config.getPosition(rect)
        drawGlow(config.color, position.x, position.y)
      })
    }

    // Initial setup
    resizeCanvas()

    // Handle window resize
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [animatedRadius, animatedOpacity])

  // Animate radius when component mounts
  useEffect(() => {
    // Wait for the glow opacity animation to complete (1.3s from timeline)
    const animationDelay = 1300 // 1.3s total

    const timer = setTimeout(() => {
      // Animate radius from 200 to 240 over 0.6s
      const startRadius = 200
      const endRadius = 224
      const duration = 600 // 0.6s
      const startTime = Date.now()

      const animateRadius = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        const currentRadius = startRadius + (endRadius - startRadius) * easedProgress
        setAnimatedRadius(currentRadius)

        if (progress < 1) {
          requestAnimationFrame(animateRadius)
        }
      }

      animateRadius()
    }, animationDelay)

    return () => clearTimeout(timer)
  }, [])

  // Animate opacity when component mounts
  useEffect(() => {
    // Start opacity animation at the same time as the glow opacity animation
    const animationDelay = 1300 // 1.3s total

    const timer = setTimeout(() => {
      // Animate opacity from 0 to 1 over 1.2s
      const startOpacity = 0
      const endOpacity = 1
      const duration = 1200 // 1.2s
      const startTime = Date.now()

      const animateOpacity = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        const currentOpacity = startOpacity - (startOpacity - endOpacity) * easedProgress
        setAnimatedOpacity(currentOpacity)

        if (progress < 1) {
          requestAnimationFrame(animateOpacity)
        }
      }

      animateOpacity()
    }, animationDelay)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className={`pointer-events-none ${className || ''}`}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

export default CanvasGlow
