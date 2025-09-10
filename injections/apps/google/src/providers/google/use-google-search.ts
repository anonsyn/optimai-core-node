import { waitForElement } from '@xagent/utils'
import { useCallback } from 'react'

interface SearchResult {
  title: string
  url: string
  description: string
  favicon?: string
}

interface SearchResponse {
  success: boolean
  message: string
}

export const useGoogleSearch = () => {
  const performSearch = useCallback(async (query: string): Promise<SearchResponse> => {
    console.log('[Google Search] Performing search for:', query)

    try {
      // Navigate to Google search if not already on Google
      if (!window.location.hostname.includes('google.com')) {
        console.log('[Google Search] Not on Google, navigating to Google search')
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query)
        return { success: true, message: 'Navigating to Google search' }
      }

      // If already on Google, use the search box
      const searchBox = (await waitForElement(
        'input[name="q"], textarea[name="q"], [role="combobox"]',
        5000
      )) as HTMLInputElement

      if (searchBox) {
        // Clear existing text and enter new query
        ;(searchBox as HTMLInputElement).value = query
        searchBox.focus()

        // Trigger input event to update Google's internal state
        searchBox.dispatchEvent(new Event('input', { bubbles: true }))

        // Submit the search
        const searchForm = searchBox.closest('form')
        if (searchForm) {
          console.log('[Google Search] Submitting search form')
          searchForm.submit()
        } else {
          // Alternative: simulate Enter key press
          console.log('[Google Search] Simulating Enter key press')
          searchBox.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              keyCode: 13,
              bubbles: true
            })
          )
        }

        return { success: true, message: 'Search submitted, page will reload' }
      } else {
        console.error('[Google Search] Could not find search box')
        // Fallback to URL navigation
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query)
        return { success: true, message: 'Fallback URL navigation' }
      }
    } catch (error: any) {
      console.error('[Google Search] Search error:', error)
      return { success: false, message: `Search failed: ${error.message}` }
    }
  }, [])

  const getSearchResults = useCallback((): SearchResult[] => {
    console.log('[Google Search] Extracting search results from current page')

    try {
      const anchors = Array.from(document.querySelectorAll('a'))
      const result = anchors
        .filter((a) => {
          return a.querySelector('h3') && a.querySelector('img')
        })
        .map((a) => {
          const imgElement = a.querySelector('img')
          return {
            title: a.querySelector('h3')?.innerText?.trim() || '',
            url: a.href,
            description: '',
            favicon: imgElement?.src || imgElement?.getAttribute('data-src') || undefined
          }
        })

      return result
    } catch (error) {
      console.error('[Google Search] Error extracting results:', error)
      return []
    }
  }, [])

  const navigateToNextPage = useCallback((): SearchResponse => {
    try {
      // Look for "Next" button or page navigation
      const nextButton =
        document.querySelector('#pnnext') ||
        document.querySelector('a[aria-label="Next page"]') ||
        document.querySelector('a[aria-label="Next"]') ||
        document.querySelector('#pnnext:not(.pn)') ||
        document.querySelector('a[id="pnnext"]')

      if (nextButton && !nextButton.hasAttribute('disabled')) {
        console.log('[Google Search] Found next page button, clicking...')
        ;(nextButton as HTMLElement).click()
        return { success: true, message: 'Next page button clicked, page will reload' }
      } else {
        console.log('[Google Search] No next page button found or disabled')
        return { success: false, message: 'No next page available' }
      }
    } catch (error: any) {
      console.error('[Google Search] Error navigating to next page:', error)
      return { success: false, message: `Navigation failed: ${error.message}` }
    }
  }, [])

  const hasNextPage = useCallback((): boolean => {
    try {
      const nextButton =
        document.querySelector('#pnnext') ||
        document.querySelector('a[aria-label="Next page"]') ||
        document.querySelector('a[aria-label="Next"]') ||
        document.querySelector('#pnnext:not(.pn)') ||
        document.querySelector('a[id="pnnext"]')

      return nextButton ? !nextButton.hasAttribute('disabled') : false
    } catch (error) {
      console.error('[Google Search] Error checking for next page:', error)
      return false
    }
  }, [])

  return {
    performSearch,
    getSearchResults,
    navigateToNextPage,
    hasNextPage
  }
}
