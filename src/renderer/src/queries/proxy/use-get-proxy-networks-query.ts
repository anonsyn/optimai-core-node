import { GetProxyNetworkParams, proxyService } from '@/services/proxy'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useGetProxyNetworksQuery = (params: GetProxyNetworkParams = {}) => {
  return useQuery({
    queryKey: ['proxy-networks', params],
    queryFn: () => proxyService.getNetworks(params).then((res) => res.data),
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  })
}
