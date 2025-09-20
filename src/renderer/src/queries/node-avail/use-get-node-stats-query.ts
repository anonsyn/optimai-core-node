import { GetNodeStatsParams, nodeAvailApi } from '@/api/node-avail'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const getQueryOptions = (userIpId: string | undefined, params: GetNodeStatsParams) => {
  return {
    queryKey: ['node-avail-node-stats', userIpId, params],
    queryFn: () => nodeAvailApi.getNodeStats(userIpId!, params).then((res) => res.data),
    enabled: !!userIpId,
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  }
}

export const useGetNodeStatsQuery = (userIpId: string | undefined, params: GetNodeStatsParams) => {
  return useQuery({
    ...getQueryOptions(userIpId, params),
  })
}

// export const useGetNodeStatsSuspenseQuery = (
//   nodeId: string | undefined,
//   params: GetNodeStatsParams
// ) => {
//   return useSuspenseQuery({
//     ...getQueryOptions(nodeId, params),
//   })
// }
