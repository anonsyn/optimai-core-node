import { useEffect } from 'react'
import { useGoogleApi } from './index'

/**
 * Hook to inject Google API to window object
 * This automatically makes googleApi available globally as window.googleApi
 */
export const useInjectGoogleApi = () => {
  const googleApi = useGoogleApi()

  useEffect(() => {
    window.googleApi = googleApi
    console.log('[Google] API injected to window.googleApi')
  }, [googleApi])

  return googleApi
}
