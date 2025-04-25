import { authService } from '@/services/auth'
import { AppMutationOptions } from '@/types/react-query'
import { useMutation } from '@tanstack/react-query'

export const useResendVerifyEmailMutation = (options: AppMutationOptions = {}) => {
  return useMutation({
    mutationFn: authService.resendVerifyEmail,
    ...options,
  })
}
