import { missionApi } from '@/api/missions'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'network-mission'
const RQUERY = (id: string) => [RQUERY_ROOT, id]

export const useGetNetworkMissionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: RQUERY(id),
    queryFn: async () => {
      return missionApi.getNetworkMissionById(id).then((res) => res.data)
    },
  })
}
