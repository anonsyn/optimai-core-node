import { miningApi } from '@/api/mining'
import { useQuery } from '@tanstack/react-query'
import { miningKeys } from './keys'

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningAssignmentDetailQuery = (assignmentId: string, options?: Options) => {
  return useQuery({
    queryKey: miningKeys.assignmentDetail(assignmentId),
    queryFn: async () => {
      const { data } = await miningApi.getAssignmentDetail(assignmentId)
      return data
    },
    staleTime: 1000 * 10, // Consider data stale after 10 seconds
    retry: options?.retry ?? false,
    enabled: (options?.enabled ?? true) && !!assignmentId
  })
}
