import { authService } from '@/services/auth'
import { AppMutationOptions } from '@/types/react-query'
import { useMutation } from '@tanstack/react-query'

export const useExchangeTokenMutation = (options: AppMutationOptions = {}) => {
  return useMutation({
    mutationFn: authService.exchangeToken,
    ...options,
  })
}
