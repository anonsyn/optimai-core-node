import { GetNodeRewardsParams, GetNodeRewardsResponse, nodeAvailService } from '@/services/node-avail'
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

const getQueryOptions = (params?: GetNodeRewardsParams) => {
  return {
    queryKey: ['node-avail-node-rewards', params],
    queryFn: () => nodeAvailService.getNodeRewards(params).then((res) => res.data),
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
    staleTime: 1000 * 60 * 5,
  }
}

export const useGetNodeRewardsQuery = (params?: GetNodeRewardsParams) => {
  return useQuery({
    ...getQueryOptions(params),
  })
}

export const useGetInfiniteNodeRewardsQuery = (params: Omit<GetNodeRewardsParams, 'offset'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['node-avail-node-rewards', params],
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetNodeRewardsResponse, __, lastPageParams) => {
      const lastOffset = lastPageParams
      const limit = params?.limit || 20
      const total = lastPage.total
      const offset = lastPageParams + limit
      return lastOffset >= total || offset >= 100 ? null : offset
    },
    queryFn: ({ pageParam }) =>
      nodeAvailService.getNodeRewards({ limit: 20, ...params, offset: pageParam }).then((res) => res.data),
  })
}
