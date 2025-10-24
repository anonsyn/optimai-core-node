import { dashboardApi } from '@/api/dashboard'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { dashboardKeys } from './keys'

export const useGetNodeOperatorRewardsQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.nodeOperatorRewards(),
    queryFn: () => dashboardApi.getNodeOperatorRewards().then((res) => res.data),
    refetchInterval: 45000
  })
}

export const useGetNodeOperatorRewardsSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: dashboardKeys.nodeOperatorRewards(),
    queryFn: () => dashboardApi.getNodeOperatorRewards().then((res) => res.data),
    refetchInterval: 45000
  })
}
