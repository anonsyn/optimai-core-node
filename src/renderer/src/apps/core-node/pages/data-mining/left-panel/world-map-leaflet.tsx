import type { MapNodeLocation } from '@/api/stats'
import { useMapNodesQuery } from '@/queries/stats/use-map-nodes-query'
import type { GeoJsonObject } from 'geojson'
import type { LatLngExpression } from 'leaflet'
import { isNumber } from 'lodash'
import React, { memo, useEffect, useMemo } from 'react'
import { CircleMarker, GeoJSON, MapContainer, useMap } from 'react-leaflet'

interface WorldMapLeafletProps {
  latitude?: number | null
  longitude?: number | null
}

const DEFAULT_CENTER: LatLngExpression = [0, 0]
const DEFAULT_ZOOM = 0.24
const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [40, -80],
  [40, 80]
]
const WORLD_PADDING: [number, number] = [0, 0]

// Component to fit bounds to world
const FitWorldBounds = memo(() => {
  const map = useMap()

  useEffect(() => {
    const fitMapToWorld = () => {
      map.invalidateSize()
      map.fitBounds(WORLD_BOUNDS, {
        padding: WORLD_PADDING,
        animate: false,
        maxZoom: DEFAULT_ZOOM
      })
    }

    let frameId: number | null = null

    if (typeof window !== 'undefined') {
      frameId = window.requestAnimationFrame(fitMapToWorld)
      window.addEventListener('resize', fitMapToWorld)
    } else {
      fitMapToWorld()
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId)
        }
        window.removeEventListener('resize', fitMapToWorld)
      }
    }
  }, [map])

  return null
})

FitWorldBounds.displayName = 'FitWorldBounds'

// Component to load and render GeoJSON with proper styling
const WorldGeography = memo(() => {
  const map = useMap()
  const [geoData, setGeoData] = React.useState<GeoJsonObject | null>(null)

  useEffect(() => {
    // Create custom pane for geography
    if (!map.getPane('geography')) {
      const pane = map.createPane('geography')
      pane.style.zIndex = '200'
    }
  }, [map])

  useEffect(() => {
    // Fetch GeoJSON data
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then((response) => response.json())
      .then((data) => {
        console.log('GeoJSON loaded successfully')
        setGeoData(data)
      })
      .catch((error) => {
        console.error('Error loading GeoJSON:', error)
      })
  }, [])

  if (!geoData) return null

  return (
    <GeoJSON
      data={geoData}
      pane="geography"
      style={{
        fillColor: '#242926',
        fillOpacity: 0.6,
        color: 'rgba(255, 255, 255, 0.05)',
        weight: 0.75
      }}
    />
  )
})

WorldGeography.displayName = 'WorldGeography'

export const WorldMapLeaflet = memo(({ latitude, longitude }: WorldMapLeafletProps) => {
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
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={0}
        maxZoom={6}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomSnap={0.01}
        zoomDelta={0.01}
        boxZoom={false}
        keyboard={false}
        style={{ background: 'transparent' }}
      >
        <FitWorldBounds />
        <WorldGeography />

        <Nodes />

        {hasValidLocation && (
          <>
            {/* Outer ring */}
            <CircleMarker
              center={[finalLatitude, finalLongitude]}
              radius={4}
              pathOptions={{
                color: '#ffffff',
                weight: 1.5,
                opacity: 0.4,
                fillOpacity: 0
              }}
            />
            {/* Inner dot */}
            <CircleMarker
              center={[finalLatitude, finalLongitude]}
              radius={2}
              pathOptions={{
                color: '#ffffff',
                weight: 0,
                fillColor: '#ffffff',
                fillOpacity: 1
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
})

WorldMapLeaflet.displayName = 'WorldMapLeaflet'

const Nodes = memo(() => {
  // Fetch top countries data to get country codes for filtering nodes
  // const { data: topCountriesData } = useGetTopCountries({
  //   limit: 10 // Focus on top 10 countries for performance
  // })

  // Extract country codes for filtering nodes (only from top countries)
  // const countryCodes = useMemo(() => {
  //   return topCountriesData?.metrics.top_countries.map((c) => c.country_code)
  // }, [topCountriesData])

  // Fetch network nodes (filtered by top countries)
  const { data: mapNodesData } = useMapNodesQuery({
    // enabled: !!countryCodes,
    // countries: countryCodes,
    max_per_country: 100,
    target_total: 1000
  })

  const nodes = useMemo(() => {
    if (!mapNodesData?.nodes) return []
    return mapNodesData.nodes.filter((node) => {
      return (
        node.latitude >= -90 &&
        node.latitude <= 90 &&
        node.longitude >= -180 &&
        node.longitude <= 180
      )
    })
  }, [mapNodesData?.nodes])

  console.log({ nodes })

  return (
    <>
      {nodes.map((node) => (
        <NodeMarker key={node.id} node={node} />
      ))}
    </>
  )
})

Nodes.displayName = 'LeafletNodes'

const NodeMarker = memo(({ node }: { node: MapNodeLocation }) => {
  const nodeColor = node.status === 'online' ? '#5eed87' : '#71717a'

  return (
    <CircleMarker
      center={[node.latitude, node.longitude]}
      radius={1.2}
      pathOptions={{
        color: nodeColor,
        weight: 0,
        fillOpacity: 1,
        fillColor: nodeColor,
        className: node.status === 'online' ? 'node-marker-online' : ''
      }}
      bubblingMouseEvents={false}
      interactive={false}
    />
  )
})

NodeMarker.displayName = 'LeafletNodeMarker'
