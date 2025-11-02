import { statsApi, type MapNodesQueryOptions } from '@/api/stats'
import { sleep } from '@/utils/sleep'
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
    enabled = true
  } = options

  return useQuery({
    queryKey: statsKeys.mapNodes({ country, countries, max_per_country, target_total, no_cache }),
    queryFn: async () => {
      await sleep(5000)
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
    refetchInterval: false,
    staleTime: 1000 * 60 * 60 // 1 hour
  })
}
