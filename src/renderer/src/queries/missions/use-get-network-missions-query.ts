import { missionService, TaskStatus } from '@/services/missions'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'network-missions'
export const RQUERY = () => [RQUERY_ROOT]

export const useGetNetworkMissionsQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      return missionService.getNetworkMissions().then((res) => res.data)
    },
    refetchInterval: (query) => {
      const res = query.state.data
      if (res) {
        const hasTaskVerifying = res.some((task) => task.status === TaskStatus.VERIFYING)
        if (hasTaskVerifying) {
          return 1000 * 15
        }
      }
      return 1000 * 60 * 10
    },
  })
}

export const useGetNetworkMissionSuspenseQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      return missionService.getNetworkMissions().then((res) => res.data)
    },
  })
}
