import { dashboardApi } from '@/api/dashboard'
import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { dashboardKeys } from './keys'

export const useGetDashboardStatsQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getDashboardStats().then((res) => res.data),
    refetchInterval: 60000,
    placeholderData: keepPreviousData
  })
}

export const useGetDashboardStatsSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getDashboardStats().then((res) => res.data),
    refetchInterval: 60000
  })
}
