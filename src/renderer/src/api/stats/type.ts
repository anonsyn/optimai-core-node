// Map Nodes Types
export interface MapNodeLocation {
  id: string
  device_id: string
  country_code: string
  country_name: string
  continent: string
  latitude: number
  longitude: number
  status: 'online' | 'offline'
  device_type: string
  last_seen_at: string
}

export interface MapNodesResponse {
  nodes: MapNodeLocation[]
  total_found: number
  countries_included: string[]
  max_per_country: number
  cached: boolean
  last_updated: string
}

export interface MapNodesQueryOptions {
  country?: string
  countries?: string[]
  max_per_country?: number
  target_total?: number
  no_cache?: boolean
}
