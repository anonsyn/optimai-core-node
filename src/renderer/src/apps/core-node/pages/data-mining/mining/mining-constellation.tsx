import { MiningStatus } from '@main/node/types'
import { motion } from 'framer-motion'
import { memo, useEffect, useRef } from 'react'

interface MiningConstellationProps {
  status: MiningStatus
  className?: string
}

interface Block {
  x: number
  y: number
  z: number
  size: number
  mined: boolean
  mining: boolean
  opacity: number
  pulsePhase: number
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

    // Initialize blocks in a 3D cube formation
    const initBlocks = () => {
      const config = getStatusConfig(statusRef.current)
      const blocks: Block[] = []
      const layers = 3
      const blocksPerLayer = Math.ceil(config.blockCount / layers)

      for (let layer = 0; layer < layers; layer++) {
        const radius = 50 + layer * 20
        const angleStep = (Math.PI * 2) / blocksPerLayer

        for (let i = 0; i < blocksPerLayer && blocks.length < config.blockCount; i++) {
          const angle = i * angleStep
          blocks.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (layer - 1) * 30,
            size: 15 + Math.random() * 10,
            mined: false,
            mining: false,
            opacity: 0.3,
            pulsePhase: Math.random() * Math.PI * 2
          })
        }
      }

      // Set some blocks as actively mining
      for (let i = 0; i < config.activeBlocks && i < blocks.length; i++) {
        blocks[Math.floor(Math.random() * blocks.length)].mining = true
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

      // Update rotation
      rotationRef.current += config.rotationSpeed

      // Sort blocks by z-index for proper rendering
      const sortedBlocks = [...blocks].sort((a, b) => {
        const rotatedA = rotatePoint(a.x, a.z, rotationRef.current)
        const rotatedB = rotatePoint(b.x, b.z, rotationRef.current)
        return rotatedA.z - rotatedB.z
      })

      // Update and draw blocks
      sortedBlocks.forEach((block) => {
        // Update mining progress
        if (block.mining) {
          block.pulsePhase += 0.05
          block.opacity = 0.5 + Math.sin(block.pulsePhase) * 0.3

          // Randomly complete mining
          if (Math.random() < config.miningSpeed) {
            block.mined = true
            block.mining = false
            block.opacity = 1

            // Start mining another block
            const unmined = blocks.filter((b) => !b.mined && !b.mining)
            if (unmined.length > 0) {
              unmined[Math.floor(Math.random() * unmined.length)].mining = true
            }
          }
        }

        // Apply 3D rotation
        const rotated = rotatePoint(block.x, block.z, rotationRef.current)
        const projected = project3D(rotated.x, block.y, rotated.z, centerX, centerY)

        // Calculate size based on depth
        const scale = 1 + rotated.z / 200
        const size = block.size * scale

        // Draw block shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(projected.x - size / 2 + 2, projected.y - size / 2 + 2, size, size)

        // Draw block
        if (block.mined) {
          // Mined block - golden
          const gradient = ctx.createLinearGradient(
            projected.x - size / 2,
            projected.y - size / 2,
            projected.x + size / 2,
            projected.y + size / 2
          )
          gradient.addColorStop(0, '#F6F655')
          gradient.addColorStop(1, '#FFD700')
          ctx.fillStyle = gradient
        } else if (block.mining) {
          // Mining block - pulsing green
          const gradient = ctx.createRadialGradient(
            projected.x,
            projected.y,
            0,
            projected.x,
            projected.y,
            size
          )
          gradient.addColorStop(0, `rgba(94, 237, 135, ${block.opacity})`)
          gradient.addColorStop(1, `rgba(94, 237, 135, ${block.opacity * 0.3})`)
          ctx.fillStyle = gradient
        } else {
          // Unmined block - gray
          ctx.fillStyle = `rgba(100, 100, 100, ${block.opacity})`
        }

        // Draw the block
        ctx.fillRect(projected.x - size / 2, projected.y - size / 2, size, size)

        // Add mining effect
        if (block.mining) {
          // Draw pickaxe strike effect
          ctx.strokeStyle = '#5EED87'
          ctx.lineWidth = 2
          ctx.globalAlpha = Math.sin(block.pulsePhase) * 0.5 + 0.5

          // Draw X pattern
          ctx.beginPath()
          ctx.moveTo(projected.x - size / 3, projected.y - size / 3)
          ctx.lineTo(projected.x + size / 3, projected.y + size / 3)
          ctx.moveTo(projected.x + size / 3, projected.y - size / 3)
          ctx.lineTo(projected.x - size / 3, projected.y + size / 3)
          ctx.stroke()

          ctx.globalAlpha = 1
        }

        // Add sparkle to mined blocks
        if (block.mined) {
          const sparklePhase = Date.now() / 1000
          const sparkleOpacity = Math.sin(sparklePhase * 2 + block.pulsePhase) * 0.5 + 0.5

          ctx.fillStyle = `rgba(255, 255, 255, ${sparkleOpacity})`
          ctx.beginPath()
          ctx.arc(projected.x + size / 3, projected.y - size / 3, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw center mining beam
      if (statusRef.current === MiningStatus.InitializingCrawler) {
        const beamPhase = Date.now() / 1000
        const beamOpacity = Math.sin(beamPhase) * 0.3 + 0.3

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100)
        gradient.addColorStop(0, `rgba(94, 237, 135, ${beamOpacity})`)
        gradient.addColorStop(1, 'rgba(94, 237, 135, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(centerX - 100, centerY - 100, 200, 200)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Helper functions
    const rotatePoint = (x: number, z: number, angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: x * cos - z * sin,
        z: x * sin + z * cos
      }
    }

    const project3D = (x: number, y: number, z: number, centerX: number, centerY: number) => {
      const perspective = 200
      const scale = perspective / (perspective + z)
      return {
        x: centerX + x * scale,
        y: centerY + y * scale * 0.8 // Compress Y for isometric feel
      }
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
