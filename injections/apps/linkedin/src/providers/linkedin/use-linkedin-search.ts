import { clickElement, insertTextIntoElement, sleep, waitForElement } from '@xagent/utils'
import { useCallback } from 'react'

const LINKEDIN_SEARCH_SELECTORS = {
  searchBox: '.search-global-typeahead__input, [data-test-id="search-global-typeahead__input"]',
  searchResults: '.search-results-container, [data-test-id="search-results"]',

  // Filter buttons
  allFilter: '[data-test-id="search-filter-all"], .search-s-facet[data-test-id*="all"]',
  peopleFilter: '[data-test-id="search-filter-people"], .search-s-facet[data-test-id*="people"]',
  companiesFilter:
    '[data-test-id="search-filter-companies"], .search-s-facet[data-test-id*="companies"]',
  postsFilter: '[data-test-id="search-filter-content"], .search-s-facet[data-test-id*="content"]',
  jobsFilter: '[data-test-id="search-filter-jobs"], .search-s-facet[data-test-id*="jobs"]'
} as const

export type SearchType = 'all' | 'people' | 'companies' | 'posts' | 'jobs'

export interface SearchOptions {
  type?: SearchType
}

/**
 * Apply search type filter
 */
async function applySearchFilter(type: SearchType): Promise<void> {
  const filterSelectors = {
    all: LINKEDIN_SEARCH_SELECTORS.allFilter,
    people: LINKEDIN_SEARCH_SELECTORS.peopleFilter,
    companies: LINKEDIN_SEARCH_SELECTORS.companiesFilter,
    posts: LINKEDIN_SEARCH_SELECTORS.postsFilter,
    jobs: LINKEDIN_SEARCH_SELECTORS.jobsFilter
  }

  const filterSelector = filterSelectors[type]
  const filterButton = await waitForElement(filterSelector, 5000)

  if (filterButton) {
    await clickElement(filterButton)
    await sleep(2000) // Wait for filtered results to load
    console.log(`[LinkedIn Search] Applied ${type} filter`)
  } else {
    console.warn(`[LinkedIn Search] ${type} filter button not found`)
  }
}

export const useLinkedInSearchApi = () => {
  const search = useCallback(
    async (query: string, options: SearchOptions = {}): Promise<boolean> => {
      try {
        const { type = 'all' } = options

        console.log(`[LinkedIn Search] Searching for "${query}" with type "${type}"`)

        // Focus on search box and enter query
        const searchBox = await waitForElement(LINKEDIN_SEARCH_SELECTORS.searchBox, 10000)
        if (!searchBox) {
          throw new Error('Search box not found')
        }

        // Clear and enter search query
        await insertTextIntoElement(searchBox, query)
        await sleep(500)

        // Submit search
        const searchButton = searchBox
          .closest('form')
          ?.querySelector('button[type="submit"]') as HTMLElement
        if (searchButton) {
          await clickElement(searchButton)
        } else {
          // Fallback: press Enter
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
          searchBox.dispatchEvent(enterEvent)
        }

        await sleep(2000)

        // Apply search type filter if not 'all'
        if (type !== 'all') {
          await applySearchFilter(type)
        }

        // Wait for search results to load
        await waitForElement(LINKEDIN_SEARCH_SELECTORS.searchResults, 10000)
        await sleep(1500)

        console.log(`[LinkedIn Search] Search completed for "${query}"`)
        return true
      } catch (error) {
        console.error(`[LinkedIn Search] Search failed for "${query}":`, error)
        return false
      }
    },
    []
  )

  return { search }
}
