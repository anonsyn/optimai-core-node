import { useEffect } from 'react'
import { useXApi } from './index'

/**
 * Hook to inject X API to window object
 * This automatically makes xApi available globally as window.xApi
 */
export const useInjectXApi = () => {
  const xApi = useXApi()

  useEffect(() => {
    window.xApi = xApi
    console.log('[X] API injected to window.xApi')
  }, [xApi])

  return xApi
}
