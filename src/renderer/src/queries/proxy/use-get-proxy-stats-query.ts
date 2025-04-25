import { proxyService } from '@/services/proxy'
import { useQuery } from '@tanstack/react-query'

export const useGetProxyStatsQuery = () => {
  return useQuery({
    queryKey: ['proxy-stats'],
    queryFn: () => proxyService.getStats().then((res) => res.data),
    refetchInterval: 1000 * 120,
  })
}
