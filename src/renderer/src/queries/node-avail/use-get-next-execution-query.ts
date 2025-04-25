import { nodeAvailService } from '@/services/node-avail'
import { useQuery } from '@tanstack/react-query'

export const useGetNextExecutionQuery = () => {
  return useQuery({
    queryKey: ['reward-schedule'],
    queryFn: () => nodeAvailService.getRewardSchedule().then((res) => res.data),
    // refetchInterval: 60000,
  })
}
