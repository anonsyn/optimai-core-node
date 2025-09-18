import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'mining-assignments'
export const MINING_ASSIGNMENTS_RQUERY = (limit?: number) => [RQUERY_ROOT, { limit }]

interface Options {
  enabled?: boolean
  retry?: boolean
  limit?: number
}

export const useGetMiningAssignmentsQuery = (options?: Options) => {
  return useQuery({
    queryKey: MINING_ASSIGNMENTS_RQUERY(options?.limit),
    queryFn: async () => {
      const data = await window.nodeIPC.getMiningAssignmentsApi({
        limit: options?.limit ?? 50
      })
      if (!data) {
        throw new Error('Failed to fetch mining assignments')
      }
      return data
    },
    refetchInterval: 5000, // Refresh every 3 seconds
    staleTime: 1000 * 5, // Consider data stale after 5 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}
