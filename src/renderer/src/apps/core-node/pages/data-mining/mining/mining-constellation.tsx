import { MiningStatus } from '@main/node/types'
import { motion } from 'framer-motion'
import { memo, useEffect, useRef } from 'react'

interface MiningConstellationProps {
  status: MiningStatus
  className?: string
}

interface Block {
  angle: number
  radius: number
  size: number
  mined: boolean
  mining: boolean
  opacity: number
  pulsePhase: number
  progress: number
  layer: number
}

const MiningConstellation = ({ status, className }: MiningConstellationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blocksRef = useRef<Block[]>([])
  const animationRef = useRef<number>(0)
  const statusRef = useRef(status)
  const rotationRef = useRef(0)

  // Status-specific configurations
  const getStatusConfig = (currentStatus: MiningStatus) => {
    switch (currentStatus) {
      case MiningStatus.Idle:
        return {
          blockCount: 12,
          miningSpeed: 0.001,
          rotationSpeed: 0.002,
          activeBlocks: 1
        }
      case MiningStatus.Initializing:
        return {
          blockCount: 16,
          miningSpeed: 0.003,
          rotationSpeed: 0.004,
          activeBlocks: 3
        }
      case MiningStatus.InitializingCrawler:
        return {
          blockCount: 20,
          miningSpeed: 0.005,
          rotationSpeed: 0.006,
          activeBlocks: 5
        }
      default:
        return {
          blockCount: 12,
          miningSpeed: 0.001,
          rotationSpeed: 0.002,
          activeBlocks: 1
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

    // Initialize blocks in a circular progress wheel
    const initBlocks = () => {
      const config = getStatusConfig(statusRef.current)
      const blocks: Block[] = []
      const blocksPerRing = 12
      const rings = Math.ceil(config.blockCount / blocksPerRing)

      for (let ring = 0; ring < rings; ring++) {
        const radius = 60 + ring * 25
        const blocksInThisRing = Math.min(blocksPerRing, config.blockCount - blocks.length)
        const angleStep = (Math.PI * 2) / blocksInThisRing

        for (let i = 0; i < blocksInThisRing; i++) {
          const angle = i * angleStep - Math.PI / 2 // Start from top
          blocks.push({
            angle: angle,
            radius: radius,
            size: 12 + ring * 2,
            mined: false,
            mining: false,
            opacity: 0.2,
            pulsePhase: Math.random() * Math.PI * 2,
            progress: 0,
            layer: ring
          })
        }
      }

      // Start mining from the first block
      if (blocks.length > 0) {
        blocks[0].mining = true
      }

      blocksRef.current = blocks
    }

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      const config = getStatusConfig(statusRef.current)
      const blocks = blocksRef.current
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Draw progress wheel background
      const wheelRotation = rotationRef.current
      rotationRef.current += config.rotationSpeed

      // Draw center circle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
      ctx.stroke()

      // Draw status text in center
      ctx.fillStyle = '#5EED87'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Show status-based text
      if (statusRef.current === MiningStatus.Idle) {
        ctx.fillText('START', centerX, centerY)
      } else if (statusRef.current === MiningStatus.Initializing) {
        ctx.fillText('CHECK', centerX, centerY)
      } else if (statusRef.current === MiningStatus.InitializingCrawler) {
        ctx.fillText('SETUP', centerX, centerY)
      }

      // Update and draw blocks
      blocks.forEach((block, index) => {
        // Calculate position with rotation
        const rotatedAngle = block.angle + wheelRotation * (block.layer + 1) * 0.2
        const x = centerX + Math.cos(rotatedAngle) * block.radius
        const y = centerY + Math.sin(rotatedAngle) * block.radius

        // Update mining progress
        if (block.mining) {
          block.progress += config.miningSpeed * 2
          block.pulsePhase += 0.1
          block.opacity = 0.4 + Math.sin(block.pulsePhase) * 0.3

          // Complete mining when progress reaches 100%
          if (block.progress >= 1) {
            block.mined = true
            block.mining = false
            block.opacity = 1
            block.progress = 1

            // Find next block to mine (sequential)
            const nextIndex = (index + 1) % blocks.length
            const nextBlock = blocks[nextIndex]
            if (!nextBlock.mined && !nextBlock.mining) {
              nextBlock.mining = true
            } else {
              // Find any pending block
              const pending = blocks.filter((b) => !b.mined && !b.mining)
              if (pending.length > 0) {
                pending[0].mining = true
              }
            }
          }
        }

        // Draw connecting line
        if (index > 0 || block.layer > 0) {
          ctx.strokeStyle = block.mined ? 'rgba(94, 237, 135, 0.3)' : 'rgba(255, 255, 255, 0.05)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }

        // Draw block
        const size = block.size

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(x + 2, y + 2, size, 0, Math.PI * 2)
        ctx.fill()

        // Draw main block
        if (block.mined) {
          // Completed - gold
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
          gradient.addColorStop(0, '#FFD700')
          gradient.addColorStop(1, '#F6F655')
          ctx.fillStyle = gradient
        } else if (block.mining) {
          // In progress - green with progress fill
          // Background circle
          ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()

          // Progress arc
          ctx.strokeStyle = '#5EED87'
          ctx.lineWidth = size * 0.3
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.arc(
            x,
            y,
            size * 0.7,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * block.progress,
            false
          )
          ctx.stroke()

          // Center glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
          gradient.addColorStop(0, `rgba(94, 237, 135, ${block.opacity})`)
          gradient.addColorStop(1, 'rgba(94, 237, 135, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Pending - gray
          ctx.fillStyle = `rgba(100, 100, 100, ${block.opacity})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Add pulse effect for mining blocks
        if (block.mining) {
          ctx.strokeStyle = '#5EED87'
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.5 - block.progress * 0.3
          ctx.beginPath()
          ctx.arc(x, y, size + 5 + Math.sin(block.pulsePhase) * 3, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Add sparkle to completed blocks
        if (block.mined) {
          const sparklePhase = Date.now() / 1000
          const sparkleOpacity = Math.sin(sparklePhase * 3 + block.pulsePhase) * 0.5 + 0.5
          ctx.fillStyle = `rgba(255, 255, 255, ${sparkleOpacity})`
          ctx.beginPath()
          ctx.arc(x + size * 0.5, y - size * 0.5, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize and start animation
    initBlocks()
    animate()

    // Handle resize
    const handleResize = () => {
      initBlocks()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
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

export default memo(MiningConstellation)
