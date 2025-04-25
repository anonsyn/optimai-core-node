import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      staleTime: 1000 * 10,
      retryDelay: 5000,
      refetchInterval: false
    }
  }
})
