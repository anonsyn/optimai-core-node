import { dashboardService } from '@/services/dashboard'
import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'dashboard-stats'
export const RQUERY = () => [RQUERY_ROOT]

export const useGetDashboardStatsQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: () => dashboardService.getDashboardStats().then((res) => res.data),
    refetchInterval: 60000,
    placeholderData: keepPreviousData,
  })
}

export const useGetDashboardStatsSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: RQUERY(),
    queryFn: () => dashboardService.getDashboardStats().then((res) => res.data),
    refetchInterval: 60000,
  })
}
