/// <reference types="vite/client" />

// Type definitions for Google APIs
interface TerminalApi {
  show: () => void
  hide: () => void
  addLog: (
    message: string,
    level?: 'info' | 'success' | 'error' | 'debug' | 'loading',
    animated?: boolean
  ) => void
  clearLogs: () => void
}

interface ScrollApi {
  scrollBy: (yAmount: number) => void
  scrollToBottom: () => void
  scrollToTop: () => void
  getScrollPosition: () => number
  isScrolledToBottom: (threshold?: number) => boolean
}

interface SearchResult {
  title: string
  url: string
  description: string
}

interface SearchResponse {
  success: boolean
  message: string
}

interface GoogleApi {
  performSearch: (query: string) => Promise<SearchResponse>
  getSearchResults: () => SearchResult[]
  navigateToNextPage: () => SearchResponse
  hasNextPage: () => boolean
}

declare global {
  interface Window {
    terminalApi: TerminalApi
    scrollApi: ScrollApi
    googleApi: GoogleApi
  }
}

export {}
