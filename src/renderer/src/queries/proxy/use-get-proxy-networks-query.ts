import { GetProxyNetworkParams, proxyApi } from '@/api/proxy'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useGetProxyNetworksQuery = (params: GetProxyNetworkParams = {}) => {
  return useQuery({
    queryKey: ['proxy-networks', params],
    queryFn: () => proxyApi.getNetworks(params).then((res) => res.data),
    placeholderData: keepPreviousData,
    refetchInterval: 60000
  })
}
