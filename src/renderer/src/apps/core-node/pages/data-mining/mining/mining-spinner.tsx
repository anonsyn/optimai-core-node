import { MiningStatus } from '@main/node/types'
import { motion } from 'framer-motion'
import { memo, useEffect, useRef } from 'react'

interface MiningSpinnerProps {
  status: MiningStatus
  className?: string
}

const MiningSpinner = ({ status, className }: MiningSpinnerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const rotationRef = useRef(0)
  const statusRef = useRef(status)

  // Status-specific configurations
  const getStatusConfig = (currentStatus: MiningStatus) => {
    switch (currentStatus) {
      case MiningStatus.Idle:
        return {
          speed: 0.005, // Slower rotation
          barCount: 24, // More bars
          activeBarCount: 6,
          pulseSpeed: 0.5
        }
      case MiningStatus.Initializing:
        return {
          speed: 0.008,
          barCount: 24,
          activeBarCount: 12,
          pulseSpeed: 1
        }
      case MiningStatus.InitializingCrawler:
        return {
          speed: 0.01,
          barCount: 24,
          activeBarCount: 18,
          pulseSpeed: 1.5
        }
      default:
        return {
          speed: 0.005,
          barCount: 24,
          activeBarCount: 6,
          pulseSpeed: 0.5
        }
    }
  }

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      const config = getStatusConfig(statusRef.current)
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const radius = 60
      const barWidth = 3
      const barLength = 15 // Shorter bars

      // Update rotation
      rotationRef.current += config.speed

      // Draw spinner bars
      const angleStep = (Math.PI * 2) / config.barCount

      for (let i = 0; i < config.barCount; i++) {
        const angle = angleStep * i + rotationRef.current
        const isActive = i < config.activeBarCount

        // Calculate bar position
        const innerRadius = radius - barLength
        const x1 = centerX + Math.cos(angle) * innerRadius
        const y1 = centerY + Math.sin(angle) * innerRadius
        const x2 = centerX + Math.cos(angle) * radius
        const y2 = centerY + Math.sin(angle) * radius

        // Calculate opacity based on position and active state
        const fadePosition = (i / config.barCount) * Math.PI * 2
        const pulse = Math.sin((Date.now() / 1000) * config.pulseSpeed + fadePosition)
        const baseOpacity = isActive ? 0.9 : 0.2
        const opacity = isActive ? baseOpacity + pulse * 0.1 : baseOpacity

        // Draw bar
        ctx.lineCap = 'round'
        ctx.lineWidth = barWidth

        if (isActive) {
          // Active bars - gradient from green to yellow
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
          const hue = 120 - (i / config.activeBarCount) * 60 // Green (120) to Yellow (60)
          gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, ${opacity})`)
          ctx.strokeStyle = gradient
        } else {
          // Inactive bars - gray
          ctx.strokeStyle = `rgba(100, 100, 100, ${opacity})`
        }

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // Add glow effect for active bars
        if (isActive && pulse > 0.5) {
          ctx.shadowBlur = 5
          ctx.shadowColor = '#5EED87'
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      // Draw Pi logo in center (angular geometric design)
      ctx.save()

      // Scale and position
      const scale = 0.25 // Increased from 0.2
      const logoWidth = 183 * scale
      const logoHeight = 161 * scale
      ctx.translate(centerX - logoWidth / 2, centerY - logoHeight / 2)
      ctx.scale(scale, scale)

      // Create the Pi logo paths using the actual SVG path data
      // This is an angular, geometric logo with two main shapes

      // First path (right angular shape)
      const path1 = new Path2D(
        'M178.941 160.378H155.28C154.012 160.378 152.841 159.694 152.158 158.571L76.1517 26.9389C75.42 25.7182 75.42 24.2535 76.1517 22.984L88.0064 2.47748C89.5187 -0.159078 93.3239 -0.159078 94.8362 2.47748L176.307 143.582L182.453 154.226C184.014 156.911 182.063 160.329 178.941 160.329V160.378Z'
      )

      // Second path (left angular shape)
      const path2 = new Path2D(
        'M114.838 160.378C114.448 160.524 114.009 160.573 113.57 160.573H89.8602C89.4212 160.573 88.9821 160.524 88.5918 160.378C87.7137 160.085 86.9331 159.499 86.4453 158.62L61.9554 116.142C60.4431 113.506 56.6867 113.506 55.1744 116.142L30.9772 158.083C30.1479 159.499 28.6355 160.378 26.9769 160.378H4.0481C0.877102 160.378 -1.12307 156.96 0.486825 154.177L6.73125 143.338L46.1492 75.1781C48.5397 70.735 53.1742 67.659 58.5405 67.659C63.9068 67.659 68.1511 70.3932 70.6391 74.5433H70.7366L116.984 154.714C118.253 156.96 117.082 159.597 114.838 160.378Z'
      )

      // Apply white color
      ctx.fillStyle = '#FFFFFF'

      // Fill both paths
      ctx.fill(path1)
      ctx.fill(path2)

      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default memo(MiningSpinner)
