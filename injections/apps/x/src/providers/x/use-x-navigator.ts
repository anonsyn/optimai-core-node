import { sleep, waitForElement } from '@xagent/utils'
import { useCallback } from 'react'

const X_NAVIGATION_SELECTORS = {
  primaryColumn: '[data-testid="primaryColumn"]'
} as const

interface NavigationOptions {
  waitForLoad?: boolean
  timeout?: number
}

export const useNavigator = () => {
  const navigateToPath = useCallback(
    async (path: string, options: NavigationOptions = {}): Promise<boolean> => {
      try {
        const { waitForLoad = true, timeout = 10000 } = options

        if (window.location.pathname === path) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          await sleep(500)
          return true
        }

        history.pushState({}, '', path)
        window.dispatchEvent(new PopStateEvent('popstate'))

        if (waitForLoad) {
          await sleep(2000)
          await waitForElement(X_NAVIGATION_SELECTORS.primaryColumn, timeout)
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
        await sleep(500)
        return true
      } catch {
        return false
      }
    },
    []
  )

  return { navigateToPath }
}
