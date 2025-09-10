import { useEffect } from 'react'
import { useOverlayApi } from '../providers/overlay'

declare global {
  interface Window {
    overlayApi?: ReturnType<typeof useOverlayApi>
  }
}

/**
 * Hook to inject overlay API into window object
 * This allows external scripts to control the overlay
 */
export const useInjectOverlayApi = () => {
  const overlayApi = useOverlayApi()

  useEffect(() => {
    window.overlayApi = overlayApi

    // Clean up on unmount
    return () => {
      delete window.overlayApi
    }
  }, [overlayApi])

  return overlayApi
}
