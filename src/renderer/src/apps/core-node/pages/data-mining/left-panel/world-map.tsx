import { useGetTopCountries } from '@/queries/stats/use-get-top-countries-query'
import { useMapNodesQuery } from '@/queries/stats/use-map-nodes-query'
import { isNumber } from 'lodash'
import { memo, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

interface WorldMapProps {
  latitude?: number | null
  longitude?: number | null
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export const WorldMap = memo(({ latitude, longitude }: WorldMapProps) => {
  // Check if we have valid geolocation data for user's node
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
        projectionConfig={{ scale: 62, center: [0, 0] }}
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

        {/* Network nodes - small colored dots */}
        <Nodes />

        {/* User's device location marker - with valid geolocation (larger white marker) */}
        {hasValidLocation && (
          <Marker coordinates={[finalLongitude, finalLatitude]}>
            {/* Outer ring */}
            <circle r={4} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeOpacity={0.4} />
            {/* Inner dot */}
            <circle r={2} fill="#ffffff" />
          </Marker>
        )}
      </ComposableMap>
    </div>
  )
})

const Nodes = memo(() => {
  // Fetch top countries data to get country codes for filtering nodes
  const { data: topCountriesData } = useGetTopCountries({
    limit: 10 // Get top 50 countries
  })

  // Extract country codes for filtering nodes (only from top 50 countries)
  const countryCodes = useMemo(() => {
    return topCountriesData?.metrics.top_countries.map((c) => c.country_code)
  }, [topCountriesData])

  // Fetch network nodes (filtered by top 50 countries)
  const { data: mapNodesData } = useMapNodesQuery({
    enabled: !!countryCodes,
    countries: countryCodes,
    max_per_country: 100,
    target_total: 2000
  })

  const nodes = mapNodesData?.nodes || []

  return (
    <>
      {nodes.map((node) => {
        // Status-based colors: online = green, offline = red
        const nodeColor = node.status === 'online' ? '#5eed87' : '#f14158'
        const nodeOpacity = node.status === 'online' ? 0.8 : 0.5

        const isValidNode =
          node.latitude >= -90 &&
          node.latitude <= 90 &&
          node.longitude >= -180 &&
          node.longitude <= 180

        if (!isValidNode) return null

        const Test = () => {
          console.log('CHANGE')
          return (
            <circle
              r={0.4}
              fill={nodeColor}
              opacity={nodeOpacity}
              style={{
                filter:
                  node.status === 'online' ? 'drop-shadow(0 0 1px rgba(94, 237, 135, 0.6))' : 'none'
              }}
            />
          )
        }

        return (
          <Marker key={node.id} coordinates={[node.longitude, node.latitude]}>
            <Test />
          </Marker>
        )
      })}
    </>
  )
})

Nodes.displayName = 'Nodes'

WorldMap.displayName = 'WorldMap'
