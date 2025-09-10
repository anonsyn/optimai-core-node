import { sleep } from '@xagent/utils'
import { useCallback } from 'react'
import { useNavigator } from './use-x-navigator'

export const useSearch = () => {
  const { navigateToPath } = useNavigator()

  const isOnSearchPage = useCallback((query?: string): boolean => {
    try {
      const currentPath = window.location.pathname
      const currentSearch = window.location.search
      if (!currentPath.startsWith('/search')) return false
      if (!query) return true
      const urlParams = new URLSearchParams(currentSearch)
      const currentQuery = urlParams.get('q')
      if (currentQuery) {
        const decodedQuery = decodeURIComponent(currentQuery).toLowerCase()
        const targetQuery = query.toLowerCase()
        return decodedQuery === targetQuery
      }
      return false
    } catch {
      return false
    }
  }, [])

  const focusSearchInput = useCallback(async (): Promise<boolean> => {
    try {
      const link = document.querySelector(
        '[data-testid="AppTabBar_Explore_Link"]'
      ) as HTMLElement | null
      if (link) {
        link.click()
        await sleep(1000)
      }
      let searchBox = document.querySelector(
        '[data-testid="SearchBox_Search_Input"]'
      ) as HTMLInputElement | null
      if (!searchBox) {
        searchBox = document.querySelector('[placeholder="Search"]') as HTMLInputElement | null
      }
      if (!searchBox) {
        searchBox = document.querySelector('[aria-label="Search query"]') as HTMLInputElement | null
      }
      if (searchBox) {
        const clearBtn = document.querySelector('[data-testid="clearButton"]') as HTMLElement | null
        if (clearBtn) {
          clearBtn.click()
          await sleep(200)
        }
        searchBox.focus()
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const searchTop = useCallback(
    async (
      query: string,
      waitForLoad: boolean = true,
      timeout: number = 10000
    ): Promise<boolean> => {
      try {
        const encoded = encodeURIComponent(query)
        const path = `/search?q=${encoded}&src=typed_query`
        return await navigateToPath(path, { waitForLoad, timeout })
      } catch {
        return false
      }
    },
    [navigateToPath]
  )

  const searchLatest = useCallback(
    async (
      query: string,
      waitForLoad: boolean = true,
      timeout: number = 10000
    ): Promise<boolean> => {
      try {
        const encoded = encodeURIComponent(query)
        const path = `/search?q=${encoded}&src=typed_query&f=live`
        return await navigateToPath(path, { waitForLoad, timeout })
      } catch {
        return false
      }
    },
    [navigateToPath]
  )

  const selectSearchTab = useCallback(
    async (tabType: 'top' | 'latest' | 'people' | 'photos' | 'videos'): Promise<boolean> => {
      try {
        if (!isOnSearchPage()) return false
        const tabSelectors: Record<string, string> = {
          top: 'a[role="tab"][href*="/search"][href*="&f=top"]',
          latest: 'a[role="tab"][href*="/search"][href*="&f=live"]',
          people: 'a[role="tab"][href*="/search"][href*="&f=user"]',
          photos: 'a[role="tab"][href*="/search"][href*="&f=image"]',
          videos: 'a[role="tab"][href*="/search"][href*="&f=video"]'
        }
        const selector = tabSelectors[tabType]
        if (!selector) return false
        const tabElement = document.querySelector(selector) as HTMLElement | null
        if (tabElement) {
          tabElement.click()
          await sleep(1000)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [isOnSearchPage]
  )

  const selectLatestTab = useCallback(async (): Promise<boolean> => {
    return await selectSearchTab('latest')
  }, [selectSearchTab])

  return {
    isOnSearchPage,
    focusSearchInput,
    searchTop,
    searchLatest,
    selectSearchTab,
    selectLatestTab
  }
}
