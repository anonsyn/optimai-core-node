import { GetProxyRewardsParams, GetProxyRewardsResponse, proxyApi } from '@/api/proxy'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export const useGetProxyRewardsQuery = (params?: GetProxyRewardsParams) => {
  return useQuery({
    queryKey: ['proxy-rewards', params],
    queryFn: () => proxyApi.getProxyRewards(params).then((res) => res.data),
    refetchInterval: 60000,
  })
}

export const useGetInfiniteProxyRewardsQuery = (
  params: Omit<GetProxyRewardsParams, 'offset'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['proxy-rewards', params],
    initialPageParam: 0,
    getNextPageParam: (lastPage: GetProxyRewardsResponse, __, lastPageParams) => {
      const lastOffset = lastPageParams
      const limit = params?.limit || 20
      const total = lastPage.total
      const offset = lastPageParams + limit
      return lastOffset >= total || offset >= 100 ? null : offset
    },
    queryFn: ({ pageParam }) =>
      proxyApi
        .getProxyRewards({ limit: 20, ...params, offset: pageParam })
        .then((res) => res.data),
    refetchInterval: 60000,
  })
}
