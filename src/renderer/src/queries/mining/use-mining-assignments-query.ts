import { GetMiningAssignmentsParams, miningApi } from '@/api/mining'
import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = 'mining-assignments'
export const getMiningAssignmentsQueryKey = (params?: GetMiningAssignmentsParams) => [
  QUERY_KEY,
  params
]

interface Options extends GetMiningAssignmentsParams {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningAssignmentsQuery = (options?: Options) => {
  const params: GetMiningAssignmentsParams = {
    limit: options?.limit ?? 50,
    platforms: options?.platforms,
    statuses: options?.statuses,
    search_query_id: options?.search_query_id,
    offset: options?.offset,
    created_after: options?.created_after
  }

  return useQuery({
    queryKey: getMiningAssignmentsQueryKey(params),
    queryFn: async () => {
      const { data } = await miningApi.getAssignments(params)
      return data
    },
    refetchInterval: 60000, // Refresh every 5 seconds
    staleTime: 1000 * 5, // Consider data stale after 5 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true
  })
}
