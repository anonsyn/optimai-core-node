/// <reference types="vite/client" />

// Type definitions for LinkedIn APIs
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

interface LinkedInApi {
  search: (
    query: string,
    options?: { type?: 'all' | 'people' | 'companies' | 'posts' | 'jobs' }
  ) => Promise<boolean>
  navigateToHome: () => Promise<boolean>
}

declare global {
  interface Window {
    terminalApi: TerminalApi
    scrollApi: ScrollApi
    linkedInApi: LinkedInApi
  }
}

export {}
