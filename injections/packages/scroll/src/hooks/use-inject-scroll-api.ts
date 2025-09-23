import { useEffect } from 'react'
import { useScrollApi } from '../providers/scroll'

declare global {
  interface Window {
    scrollApi?: ReturnType<typeof useScrollApi>
  }
}

/**
 * Hook to inject scroll API into window object
 * This allows external scripts to control scrolling
 */
export const useInjectScrollApi = () => {
  const scrollApi = useScrollApi()

  useEffect(() => {
    window.scrollApi = scrollApi

    // Clean up on unmount
    return () => {
      delete window.scrollApi
    }
  }, [scrollApi])

  return scrollApi
}
