import { dashboardApi } from '@/api/dashboard'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'dashboard-node-operator-rewards'
const RQUERY = () => [RQUERY_ROOT]

export const useGetNodeOperatorRewardsQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: () => dashboardApi.getNodeOperatorRewards().then((res) => res.data),
    refetchInterval: 45000,
  })
}

export const useGetNodeOperatorRewardsSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: RQUERY(),
    queryFn: () => dashboardApi.getNodeOperatorRewards().then((res) => res.data),
    refetchInterval: 45000,
  })
}
