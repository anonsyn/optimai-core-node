import { sleep, waitForElement } from '@xagent/utils'
import { useCallback } from 'react'
import { useNavigator } from './use-x-navigator'

const X_NAVIGATION_SELECTORS = {
  homeLink: '[data-testid="AppTabBar_Home_Link"]',
  primaryColumn: '[data-testid="primaryColumn"]',
  forYouTab: '[role="tab"][href="/home"]'
} as const

interface TimelineOptions {
  waitForLoad?: boolean
  timeout?: number
}

interface UserTimelineOptions extends TimelineOptions {
  username: string
}

export const useTimeline = () => {
  const { navigateToPath } = useNavigator()

  const accessHomeTimeline = useCallback(
    async (options: TimelineOptions = {}): Promise<boolean> => {
      try {
        const { waitForLoad = true, timeout = 10000 } = options
        const homeLink = document.querySelector(
          X_NAVIGATION_SELECTORS.homeLink
        ) as HTMLElement | null

        if (homeLink) {
          homeLink.click()
          if (waitForLoad) {
            await sleep(1000)
            await waitForElement(X_NAVIGATION_SELECTORS.primaryColumn, timeout)
          }
          window.scrollTo({ top: 0, behavior: 'smooth' })
          await sleep(500)
          return true
        }

        return await navigateToPath('/home', options)
      } catch {
        return false
      }
    },
    [navigateToPath]
  )

  const accessUserTimeline = useCallback(
    async ({ username, ...options }: UserTimelineOptions): Promise<boolean> => {
      try {
        const profilePath = `/${username}`
        return await navigateToPath(profilePath, options)
      } catch {
        return false
      }
    },
    [navigateToPath]
  )

  const pullTimeline = useCallback(async (): Promise<boolean> => {
    try {
      if (!window.location.pathname.includes('/home')) return false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      await sleep(1000)
      const forYouTab = document.querySelector(
        X_NAVIGATION_SELECTORS.forYouTab
      ) as HTMLElement | null
      if (!forYouTab) return false
      forYouTab.click()
      await sleep(500)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    accessHomeTimeline,
    accessUserTimeline,
    pullTimeline
  }
}
