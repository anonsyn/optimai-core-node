import { createContext, ReactNode, useCallback, useContext } from 'react'

export interface ScrollApi {
  scrollBy: (yAmount: number) => void
  scrollToBottom: () => void
  scrollToTop: () => void
  getScrollPosition: () => number
  isScrolledToBottom: (threshold?: number) => boolean
}

const ScrollApiContext = createContext<ScrollApi>({
  scrollBy: () => {},
  scrollToBottom: () => {},
  scrollToTop: () => {},
  getScrollPosition: () => 0,
  isScrolledToBottom: () => false
})

export const useScrollApi = () => {
  const context = useContext(ScrollApiContext)
  if (!context) {
    throw new Error('useScrollApi must be used within a ScrollProvider')
  }
  return context
}

interface ScrollProviderProps {
  children: ReactNode
}

export const ScrollProvider = ({ children }: ScrollProviderProps) => {
  const scrollBy = useCallback((yAmount: number) => {
    try {
      window.scrollBy({
        top: yAmount,
        left: 0,
        behavior: 'smooth'
      })
      console.log(`Scrolled by ${yAmount} pixels`)
    } catch (error) {
      console.error('Failed to scroll by amount:', error)
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    try {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
      console.log('Scrolled to bottom')
    } catch (error) {
      console.error('Failed to scroll to bottom:', error)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
      console.log('Scrolled to top')
    } catch (error) {
      console.error('Failed to scroll to top:', error)
    }
  }, [])

  const getScrollPosition = useCallback(() => {
    return window.scrollY || window.pageYOffset
  }, [])

  const isScrolledToBottom = useCallback((threshold = 10) => {
    const scrollY = window.scrollY || window.pageYOffset
    const visibleHeight = window.innerHeight
    const totalHeight = document.documentElement.scrollHeight

    return scrollY + visibleHeight >= totalHeight - threshold
  }, [])

  const api = {
    scrollBy,
    scrollToBottom,
    scrollToTop,
    getScrollPosition,
    isScrolledToBottom
  }

  return <ScrollApiContext.Provider value={api}>{children}</ScrollApiContext.Provider>
}
