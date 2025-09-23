import { missionApi, TaskStatus } from '@/api/missions'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'community-missions'
export const RQUERY = () => [RQUERY_ROOT]

export const useGetCommunityMissionsQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      return missionApi.getCommunityMissions().then((res) => res.data)
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
    }
  })
}
