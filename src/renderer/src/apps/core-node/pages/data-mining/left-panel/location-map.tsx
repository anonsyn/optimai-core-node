import { useEffect, useRef } from 'react'

interface LocationMapProps {
  latitude?: number | null
  longitude?: number | null
  country?: string | null
  className?: string
}

/**
 * Simple SVG-based mini map showing device location
 * For production, consider using Leaflet (react-leaflet)
 */
export const LocationMap = ({ latitude, longitude, country, className = '' }: LocationMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (
      !canvasRef.current ||
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    )
      return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = canvas.width
    const height = canvas.height

    // Draw background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Map latitude/longitude to canvas coordinates
    // Latitude: -90 to 90 (top to bottom)
    // Longitude: -180 to 180 (left to right)
    const x = (((longitude as number) + 180) / 360) * width
    const y = ((90 - (latitude as number)) / 180) * height

    // Draw marker circle with glow effect
    const markerRadius = 8
    const glowRadius = 14

    // Glow effect
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
    glowGradient.addColorStop(0, 'rgba(80, 205, 137, 0.4)')
    glowGradient.addColorStop(1, 'rgba(80, 205, 137, 0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2)

    // Marker circle
    ctx.fillStyle = '#50cd89'
    ctx.beginPath()
    ctx.arc(x, y, markerRadius, 0, Math.PI * 2)
    ctx.fill()

    // Marker border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, markerRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Draw latitude/longitude text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${(latitude as number).toFixed(2)}°`, x, y - markerRadius - 15)
    ctx.fillText(`${(longitude as number).toFixed(2)}°`, x, y + markerRadius + 20)
  }, [latitude, longitude])

  if (latitude === null || longitude === null) {
    return (
      <div
        className={`flex h-32 w-full items-center justify-center rounded-lg bg-white/5 ${className}`}
      >
        <span className="text-12 text-white/50">No location data available</span>
      </div>
    )
  }

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-white/10 ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={160}
        className="block h-auto w-full bg-[#1a1a1a]"
      />
      <div className="bg-white/5 px-3 py-2 text-center">
        <p className="text-11 text-white/50">
          {country && <span>{country} • </span>}
          <span className="font-mono">
            {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
          </span>
        </p>
      </div>
    </div>
  )
}
