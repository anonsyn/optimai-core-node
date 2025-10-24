import { authApi } from '@/api/auth'
import { useQuery } from '@tanstack/react-query'
import { authKeys } from './keys'

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useGetCurrentUserQuery = (options?: Options) => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      console.log('Query execute fetch user')
      return authApi.getCurrentUser().then((res) => res.data)
    },
    refetchInterval: false,
    staleTime: 1000 * 60 * 60,
    retry: options?.retry ?? false,
    enabled: options?.enabled
  })
}
