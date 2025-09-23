import { proxyApi } from '@/api/proxy'
import { useQuery } from '@tanstack/react-query'

export const useGetProxyStatsQuery = () => {
  return useQuery({
    queryKey: ['proxy-stats'],
    queryFn: () => proxyApi.getStats().then((res) => res.data),
    refetchInterval: 1000 * 120
  })
}
