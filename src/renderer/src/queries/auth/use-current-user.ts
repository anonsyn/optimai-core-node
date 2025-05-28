import { authService } from '@/services/auth'
import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'current-user'
export const RQUERY = () => [RQUERY_ROOT]

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetCurrentUserQuery = (options?: Options) => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      console.log('Query execute fetch user')
      return authService.getCurrentUser().then((res) => res.data)
    },
    refetchInterval: false,
    staleTime: 1000 * 60 * 60,
    retry: options?.retry ?? false,
    enabled: options?.enabled
  })
}
