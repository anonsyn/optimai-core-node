import { missionService } from '@/services/missions'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'community-mission'
export const RQUERY = (id: string) => [RQUERY_ROOT, id]

export const useGetCommunityMissionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: RQUERY(id),
    queryFn: async () => {
      return missionService.getCommunityMissionById(id).then((res) => res.data)
    },
  })
}
