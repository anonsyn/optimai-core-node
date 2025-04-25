import { authService } from '@/services/auth'
import { AppMutationOptions } from '@/types/react-query'
import { useMutation } from '@tanstack/react-query'

export const useSignUpMutation = (options: AppMutationOptions = {}) => {
  return useMutation({
    mutationFn: authService.signUp,
    ...options,
  })
}
