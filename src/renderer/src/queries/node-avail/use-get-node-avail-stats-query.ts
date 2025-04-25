import { nodeAvailService } from '@/services/node-avail'
import { useQuery } from '@tanstack/react-query'

export const useGetNodeAvailabilityStatsQuery = () => {
  return useQuery({
    queryKey: ['node-avail-stats'],
    queryFn: () => nodeAvailService.getStats().then((res) => res.data),
    refetchInterval: 60000,
  })
}
