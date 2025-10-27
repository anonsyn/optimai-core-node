import type { MapNodesQueryOptions } from '@/api/stats'

export const statsKeys = {
  all: ['stats'] as const,
  mapNodes: (options?: MapNodesQueryOptions) => [...statsKeys.all, 'map-nodes', options] as const
}
