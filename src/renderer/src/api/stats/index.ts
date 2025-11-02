import { apiClient } from '@/libs/axios'
import type { MapNodesQueryOptions, MapNodesResponse, TopCountriesResponse } from './type'

export const statsApi = {
  getMapNodes(options: MapNodesQueryOptions = {}) {
    const searchParams = new URLSearchParams()

    if (options.country) {
      searchParams.set('country', options.country)
    }

    if (options.countries && options.countries.length > 0) {
      searchParams.set('countries', options.countries.join(','))
    }

    if (options.max_per_country !== undefined) {
      searchParams.set('max_per_country', options.max_per_country.toString())
    }

    if (options.target_total !== undefined) {
      searchParams.set('target_total', options.target_total.toString())
    }

    if (options.no_cache) {
      searchParams.set('no_cache', 'true')
    }

    const queryString = searchParams.toString()
    const endpoint = `/stats/map-nodes${queryString ? `?${queryString}` : ''}`
    return apiClient.get<MapNodesResponse>(endpoint)
  },

  getTopCountries(options: { no_cache?: boolean; limit?: number } = {}) {
    const searchParams = new URLSearchParams()

    if (options.no_cache) {
      searchParams.set('no_cache', 'true')
    }

    if (options.limit !== undefined) {
      searchParams.set('limit', String(options.limit))
    }

    const queryString = searchParams.toString()
    const endpoint = `/stats/top-countries${queryString ? `?${queryString}` : ''}`

    return apiClient.get<TopCountriesResponse>(endpoint)
  }
}

export * from './type'
