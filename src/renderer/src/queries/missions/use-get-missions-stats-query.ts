import { missionApi } from '@/api/missions'
import { useQuery } from '@tanstack/react-query'

export const RQUERY_ROOT = 'missions-stats'
export const RQUERY = () => [RQUERY_ROOT]

export const useGetMissionsStatsQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      return missionApi.getStats().then((res) => res.data)
    },
  })
}
