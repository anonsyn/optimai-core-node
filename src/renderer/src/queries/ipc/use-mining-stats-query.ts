import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'mining-stats'
export const RQUERY = () => [RQUERY_ROOT]

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningStatsQuery = (options?: Options) => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      const data = await window.nodeIPC.getMiningStatsApi()
      if (!data) {
        throw new Error('Failed to fetch mining stats')
      }
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 20, // Consider data stale after 20 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}