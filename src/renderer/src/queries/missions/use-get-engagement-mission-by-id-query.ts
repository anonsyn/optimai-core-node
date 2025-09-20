import { missionApi } from '@/api/missions'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'engagement-mission'
const RQUERY = (id: string) => [RQUERY_ROOT, id]

export const useGetEngagementMissionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: RQUERY(id),
    queryFn: async () => {
      return missionApi.getEngagementMissionById(id).then((res) => res.data)
    },
  })
}
