import { miningApi } from '@/api/mining'
import { useQuery } from '@tanstack/react-query'
import { miningKeys } from './keys'

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningStatsQuery = (options?: Options) => {
  return useQuery({
    queryKey: miningKeys.stats(),
    queryFn: async () => {
      const { data } = await miningApi.getStats()
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 20, // Consider data stale after 20 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}
