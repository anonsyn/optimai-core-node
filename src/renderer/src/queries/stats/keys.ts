import type { MapNodesQueryOptions } from '@/api/stats'

export const statsKeys = {
  all: ['stats'] as const,
  mapNodes: (options?: MapNodesQueryOptions) => [...statsKeys.all, 'map-nodes', options] as const,
  topCountries: (options?: { no_cache?: boolean; limit?: number }) =>
    [...statsKeys.all, 'top-countries', options] as const
}
