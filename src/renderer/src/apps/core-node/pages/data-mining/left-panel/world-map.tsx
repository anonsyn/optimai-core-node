import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useEffect } from 'react'

interface WorldMapProps {
  latitude?: number | null
  longitude?: number | null
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export const WorldMap = ({ latitude, longitude }: WorldMapProps) => {
  useEffect(() => {
    console.log('WorldMap received:', { latitude, longitude })
  }, [latitude, longitude])

  // Check if we have valid geolocation data
  const hasValidLocation = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined
  const finalLatitude = latitude as number
  const finalLongitude = longitude as number

  return (
    <div className="w-full h-[211px] bg-[#1a1a1a] rounded-t-lg overflow-hidden">
      <ComposableMap projection="geoEquirectangular" projectionConfig={{ scale: 60, center: [0, 0] }} width={368} height={211} style={{ width: '100%', height: '100%' }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: '#1f2937',
                    stroke: '#374151',
                    strokeWidth: 0.75,
                    outline: 'none',
                    opacity: 0.5,
                  },
                  hover: {
                    fill: '#2d3748',
                    stroke: '#4a5568',
                    strokeWidth: 0.75,
                    outline: 'none',
                    cursor: 'pointer',
                    opacity: 0.6,
                  },
                  pressed: {
                    fill: '#1f2937',
                    stroke: '#374151',
                    strokeWidth: 0.75,
                    outline: 'none',
                    opacity: 0.5,
                  },
                }}
              />
            ))
          }
        </Geographies>

        {/* Device location marker - with valid geolocation */}
        {hasValidLocation && (
          <Marker coordinates={[finalLongitude, finalLatitude]}>
            {/* Outer ring */}
            <circle r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} />
            {/* Inner dot */}
            <circle r={5} fill="#ffffff" />
          </Marker>
        )}

        {/* Fallback marker at center for localhost/no geolocation */}
        {!hasValidLocation && (
          <Marker coordinates={[0, 0]}>
            {/* Outer ring - dimmed for fallback */}
            <circle r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.4} />
            {/* Inner dot - dimmed for fallback */}
            <circle r={5} fill="#ffffff" opacity={0.4} />
          </Marker>
        )}
      </ComposableMap>
    </div>
  )
}
