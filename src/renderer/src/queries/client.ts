import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      staleTime: 1000 * 10,
      gcTime: 1000 * 60 * 60, // 1 hours - needed for persistence
      retryDelay: 5000,
      refetchInterval: false
    }
  }
})

export const persistQueryClient = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'query-cache'
})
