import { useLinkedInNavigatorApi } from '@/providers/linkedin/use-linkedin-navigator'
import { useLinkedInSearchApi } from '@/providers/linkedin/use-linkedin-search'
import { createContext, useContext } from 'react'

export interface LinkedInApi {
  search: (
    query: string,
    options?: { type?: 'all' | 'people' | 'companies' | 'posts' | 'jobs' }
  ) => Promise<boolean>
  navigateToHome: () => Promise<boolean>
}

const LinkedInApiContext = createContext<LinkedInApi>({
  search: async () => false,
  navigateToHome: async () => false
})

export const useLinkedInApi = () => {
  const context = useContext(LinkedInApiContext)
  if (!context) {
    throw new Error('useLinkedInApi must be used within a LinkedInProvider')
  }
  return context
}

export const LinkedInProvider = ({ children }: { children: React.ReactNode }) => {
  const searchApi = useLinkedInSearchApi()
  const navigatorApi = useLinkedInNavigatorApi()

  const api: LinkedInApi = {
    ...searchApi,
    ...navigatorApi
  }

  return <LinkedInApiContext.Provider value={api}>{children}</LinkedInApiContext.Provider>
}

export { useInjectLinkedInApi } from './use-inject-linkedin-api'
