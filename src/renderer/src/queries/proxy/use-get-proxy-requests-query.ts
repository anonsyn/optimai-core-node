import { GetProxyRequestsParams, proxyApi } from '@/api/proxy'
import { useQuery } from '@tanstack/react-query'

export const useGetProxyRequestsQuery = (
  params: GetProxyRequestsParams,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ['proxy-requests', params],
    queryFn: () => proxyApi.getRequests(params).then((res) => res.data),
    enabled: true,
    refetchInterval: 60000,
    ...options
  })
}
