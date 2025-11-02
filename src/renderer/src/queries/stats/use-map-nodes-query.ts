import { statsApi, type MapNodesQueryOptions } from '@/api/stats'
import { useQuery } from '@tanstack/react-query'
import { statsKeys } from './keys'

export interface UseMapNodesOptions extends MapNodesQueryOptions {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}

export const useMapNodesQuery = (options: UseMapNodesOptions = {}) => {
  const {
    country,
    countries,
    max_per_country = 100,
    target_total = 2000,
    no_cache = false,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 60 * 60 * 1000 // 1 hours
  } = options

  return useQuery({
    queryKey: statsKeys.mapNodes({ country, countries, max_per_country, target_total, no_cache }),
    queryFn: async () => {
      return statsApi
        .getMapNodes({
          country,
          countries,
          max_per_country,
          target_total,
          no_cache
        })
        .then((res) => res.data)
    },
    enabled,
    staleTime,
    refetchInterval,
    // Retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
