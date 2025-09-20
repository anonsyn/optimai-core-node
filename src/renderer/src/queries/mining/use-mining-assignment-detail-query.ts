import { miningApi } from '@/api/mining'
import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = 'mining-assignment-detail'
export const getMiningAssignmentDetailQueryKey = (assignmentId: string) => [
  QUERY_KEY,
  assignmentId
]

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningAssignmentDetailQuery = (assignmentId: string, options?: Options) => {
  return useQuery({
    queryKey: getMiningAssignmentDetailQueryKey(assignmentId),
    queryFn: async () => {
      const { data } = await miningApi.getAssignmentDetail(assignmentId)
      return data
    },
    staleTime: 1000 * 10, // Consider data stale after 10 seconds
    retry: options?.retry ?? false,
    enabled: (options?.enabled ?? true) && !!assignmentId
  })
}