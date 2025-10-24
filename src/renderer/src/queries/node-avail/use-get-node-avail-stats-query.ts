import { nodeAvailApi } from '@/api/node-avail'
import { useQuery } from '@tanstack/react-query'
import { nodeAvailKeys } from './keys'

export const useGetNodeAvailabilityStatsQuery = () => {
  return useQuery({
    queryKey: nodeAvailKeys.stats(),
    queryFn: () => nodeAvailApi.getStats().then((res) => res.data),
    refetchInterval: 60000
  })
}
