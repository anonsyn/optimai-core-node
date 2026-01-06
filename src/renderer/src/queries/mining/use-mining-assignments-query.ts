import { GetMiningAssignmentsParams, miningApi } from '@/api/mining'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { miningKeys } from './keys'

interface Options extends GetMiningAssignmentsParams {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningAssignmentsQuery = (options?: Options) => {
  const params: GetMiningAssignmentsParams = {
    limit: options?.limit ?? 15,
    platforms: options?.platforms,
    statuses: options?.statuses,
    search_query_id: options?.search_query_id,
    offset: options?.offset,
    created_after: options?.created_after,
    sort_by: options?.sort_by,
    sort_order: options?.sort_order,
    device_id: options?.device_id
  }

  return useQuery({
    queryKey: miningKeys.assignments(params),
    queryFn: async () => {
      const { data } = await miningApi.getAssignments(params)
      return data
    },
    refetchInterval: 60_000 * 5, // Refresh every 5 minutes
    staleTime: 1000 * 10, // Consider data stale after 5 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData
  })
}
