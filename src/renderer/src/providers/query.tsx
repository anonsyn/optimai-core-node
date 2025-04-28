import { persistQueryClient, queryClient } from '@/queries/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { PropsWithChildren } from 'react'

const QueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: persistQueryClient }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}

export default QueryProvider
