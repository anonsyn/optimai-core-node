import { sleep, waitForElement } from '@xagent/utils'
import { useCallback } from 'react'

const LINKEDIN_NAVIGATION_SELECTORS = {
  mainContent: '[role="main"], .scaffold-layout__main',
  feedContainer: '.feed-container-theme, [data-test-id="feed-container"]'
} as const

interface NavigationOptions {
  waitForLoad?: boolean
  timeout?: number
  scrollToTop?: boolean
}

/**
 * Navigate to a specific path using LinkedIn's SPA navigation
 */
async function navigateToPath(path: string, options: NavigationOptions = {}): Promise<boolean> {
  try {
    const { waitForLoad = true, timeout = 10000, scrollToTop = true } = options

    console.log(`[LinkedIn Navigator] Navigating to: ${path}`)

    // Check if we're already on the correct page
    if (window.location.pathname === path) {
      console.log('[LinkedIn Navigator] Already on the target page')
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        await sleep(500)
      }
      return true
    }

    // Use history.pushState for SPA navigation
    history.pushState({}, '', path)

    // Trigger navigation event that LinkedIn listens to
    window.dispatchEvent(new PopStateEvent('popstate'))

    if (waitForLoad) {
      // Wait for the navigation to complete
      await sleep(2000)

      // Wait for main content to load
      await waitForElement(LINKEDIN_NAVIGATION_SELECTORS.mainContent, timeout)
    }

    // Scroll to top after navigation
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      await sleep(500)
    }

    console.log('[LinkedIn Navigator] Navigation completed successfully')
    return true
  } catch (error) {
    console.error(`[LinkedIn Navigator] Navigation to ${path} failed:`, error)
    return false
  }
}

export const useLinkedInNavigatorApi = () => {
  const navigateToHome = useCallback(async (): Promise<boolean> => {
    try {
      const success = await navigateToPath('/feed/')

      if (success) {
        // Wait for feed to load
        await waitForElement(LINKEDIN_NAVIGATION_SELECTORS.feedContainer, 10000)
        await sleep(1000) // Additional wait for content to stabilize
      }

      return success
    } catch (error) {
      console.error('Failed to navigate to home:', error)
      return false
    }
  }, [])

  return { navigateToHome }
}
