import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { StartupPhase } from './provider'

interface NetworkConstellationProps {
  phase: StartupPhase
  className?: string
}

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  connections: number[]
  active: boolean
  pulsePhase: number
}

const NetworkConstellation = ({ phase, className }: NetworkConstellationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number>(0)
  const phaseRef = useRef(phase)

  // Phase-specific configurations
  const getPhaseConfig = (currentPhase: StartupPhase) => {
    switch (currentPhase) {
      case StartupPhase.INITIALIZING:
        return { nodeCount: 8, connectionDistance: 100, speed: 0.3, pulseSpeed: 0.02 }
      case StartupPhase.CHECKING_UPDATES:
        return { nodeCount: 10, connectionDistance: 120, speed: 0.4, pulseSpeed: 0.025 }
      case StartupPhase.CHECKING_DOCKER:
        return { nodeCount: 12, connectionDistance: 130, speed: 0.5, pulseSpeed: 0.03 }
      case StartupPhase.INITIALIZING_CRAWLER:
        return { nodeCount: 14, connectionDistance: 140, speed: 0.6, pulseSpeed: 0.035 }
      case StartupPhase.CHECKING_AUTH:
        return { nodeCount: 16, connectionDistance: 150, speed: 0.7, pulseSpeed: 0.04 }
      case StartupPhase.STARTING_NODE:
        return { nodeCount: 18, connectionDistance: 160, speed: 0.8, pulseSpeed: 0.045 }
      case StartupPhase.COMPLETED:
        return { nodeCount: 20, connectionDistance: 180, speed: 1, pulseSpeed: 0.05 }
      default:
        return { nodeCount: 8, connectionDistance: 100, speed: 0.3, pulseSpeed: 0.02 }
    }
  }

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize nodes
    const initNodes = () => {
      const rect = canvas.getBoundingClientRect()
      const config = getPhaseConfig(phaseRef.current)
      const nodes: Node[] = []

      for (let i = 0; i < config.nodeCount; i++) {
        const angle = (i / config.nodeCount) * Math.PI * 2
        const radiusVariation = Math.random() * 30 + 50
        const x = rect.width / 2 + Math.cos(angle) * radiusVariation
        const y = rect.height / 2 + Math.sin(angle) * radiusVariation

        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          radius: Math.random() * 3 + 2,
          connections: [],
          active: Math.random() > 0.3,
          pulsePhase: Math.random() * Math.PI * 2
        })
      }

      nodesRef.current = nodes
    }

    // Update connections based on distance
    const updateConnections = (config: any) => {
      const nodes = nodesRef.current
      nodes.forEach((node, i) => {
        node.connections = []
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = node.x - otherNode.x
            const dy = node.y - otherNode.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < config.connectionDistance) {
              node.connections.push(j)
            }
          }
        })
      })
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      const config = getPhaseConfig(phaseRef.current)
      const nodes = nodesRef.current

      // Update phase config if needed
      if (nodes.length !== config.nodeCount) {
        initNodes()
      }

      // Update node positions
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        node.pulsePhase += config.pulseSpeed

        // Bounce off walls
        if (node.x < 20 || node.x > rect.width - 20) node.vx *= -1
        if (node.y < 20 || node.y > rect.height - 20) node.vy *= -1

        // Keep within bounds
        node.x = Math.max(20, Math.min(rect.width - 20, node.x))
        node.y = Math.max(20, Math.min(rect.height - 20, node.y))
      })

      // Update connections
      updateConnections(config)

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach(j => {
          const otherNode = nodes[j]
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const opacity = Math.max(0, 1 - distance / config.connectionDistance) * 0.3

          // Create gradient for connection line
          const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y)
          gradient.addColorStop(0, `rgba(246, 246, 85, ${opacity})`)
          gradient.addColorStop(0.5, `rgba(94, 237, 135, ${opacity})`)
          gradient.addColorStop(1, `rgba(246, 246, 85, ${opacity})`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(otherNode.x, otherNode.y)
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach(node => {
        const pulseFactor = Math.sin(node.pulsePhase) * 0.5 + 1
        const radius = node.radius * pulseFactor

        // Node glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 4
        )
        glowGradient.addColorStop(0, node.active ? 'rgba(94, 237, 135, 0.6)' : 'rgba(246, 246, 85, 0.4)')
        glowGradient.addColorStop(1, 'rgba(94, 237, 135, 0)')

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2)
        ctx.fill()

        // Node core
        ctx.fillStyle = node.active
          ? `rgba(94, 237, 135, ${0.8 + pulseFactor * 0.2})`
          : `rgba(246, 246, 85, ${0.6 + pulseFactor * 0.2})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize and start animation
    initNodes()
    animate()

    // Handle resize
    const handleResize = () => {
      initNodes()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </motion.div>
  )
}

export default NetworkConstellation