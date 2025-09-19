import { miningService } from '@/services/mining'
import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = 'mining-stats'
export const getMiningStatsQueryKey = () => [QUERY_KEY]

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningStatsQuery = (options?: Options) => {
  return useQuery({
    queryKey: getMiningStatsQueryKey(),
    queryFn: async () => {
      const { data } = await miningService.getStats()
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 20, // Consider data stale after 20 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}