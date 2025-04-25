import { GetProxyRequestsParams, proxyService } from '@/services/proxy'
import { useQuery } from '@tanstack/react-query'

export const useGetProxyRequestsQuery = (
  params: GetProxyRequestsParams,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ['proxy-requests', params],
    queryFn: () => proxyService.getRequests(params).then((res) => res.data),
    enabled: true,
    refetchInterval: 60000,
    ...options,
  })
}
