import { authApi } from '@/api/auth'
import { AppMutationOptions } from '@/types/react-query'
import { useMutation } from '@tanstack/react-query'

export const useSignInMutation = (options: AppMutationOptions = {}) => {
  return useMutation({
    mutationFn: authApi.signIn,
    ...options,
  })
}
