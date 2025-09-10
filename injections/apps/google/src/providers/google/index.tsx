import { createContext, useContext } from 'react'
import { useGoogleSearch } from './use-google-search'

interface SearchResult {
  title: string
  url: string
  description: string
}

interface SearchResponse {
  success: boolean
  message: string
}

export interface GoogleApi {
  performSearch: (query: string) => Promise<SearchResponse>
  getSearchResults: () => SearchResult[]
  navigateToNextPage: () => SearchResponse
  hasNextPage: () => boolean
}

const GoogleApiContext = createContext<GoogleApi>({
  performSearch: async () => ({ success: false, message: 'Not initialized' }),
  getSearchResults: () => [],
  navigateToNextPage: () => ({ success: false, message: 'Not initialized' }),
  hasNextPage: () => false
})

export const useGoogleApi = () => {
  const context = useContext(GoogleApiContext)
  if (!context) {
    throw new Error('useGoogleApi must be used within a GoogleProvider')
  }
  return context
}

export const GoogleProvider = ({ children }: { children: React.ReactNode }) => {
  const searchApi = useGoogleSearch()

  const api: GoogleApi = {
    ...searchApi
  }

  return <GoogleApiContext.Provider value={api}>{children}</GoogleApiContext.Provider>
}

export { useInjectGoogleApi } from './use-inject-google-api'
