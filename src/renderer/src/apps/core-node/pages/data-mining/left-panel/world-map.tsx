import { isNumber } from 'lodash'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

interface WorldMapProps {
  latitude?: number | null
  longitude?: number | null
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export const WorldMap = ({ latitude, longitude }: WorldMapProps) => {
  // Check if we have valid geolocation data
  const hasValidLocation = isNumber(longitude) && isNumber(latitude)
  const finalLatitude = latitude as number
  const finalLongitude = longitude as number

  return (
    <div
      className="bg-background h-[212px] w-full overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.10) 100%)',
        boxShadow: '0 0 20px 0 rgba(255, 255, 255, 0.05) inset'
      }}
    >
      <ComposableMap
        projection="geoEquirectangular"
        projectionConfig={{ scale: 60, center: [0, 0] }}
        width={368}
        height={211}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: 'rgba(36, 41, 38, 0.6)',
                    stroke: 'rgba(255, 255, 255, 0.05)',
                    strokeWidth: 0.75,
                    outline: 'none'
                  },
                  hover: {
                    fill: 'rgba(36, 41, 38, 0.8',
                    stroke: 'rgba(255, 255, 255, 0.1)',
                    strokeWidth: 0.75,
                    outline: 'none'
                  },
                  pressed: {
                    fill: 'rgba(36, 41, 38, 0.8',
                    stroke: 'rgba(255, 255, 255, 0.1)',
                    strokeWidth: 0.75,
                    outline: 'none'
                  }
                }}
              />
            ))
          }
        </Geographies>

        {/* Device location marker - with valid geolocation */}
        {hasValidLocation && (
          <Marker coordinates={[finalLongitude, finalLatitude]}>
            {/* Outer ring */}
            <circle r={4} fill="none" stroke="#ffffff" strokeWidth={1.5} />
            {/* Inner dot */}
            <circle r={2} fill="#ffffff" fillOpacity={0.4} />
          </Marker>
        )}
      </ComposableMap>
    </div>
  )
}
