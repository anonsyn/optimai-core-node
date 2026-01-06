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
    refetchInterval: 60_000 * 5, // Refresh every 5 minutes
    staleTime: 1000 * 30, // Consider data stale after 30 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}
