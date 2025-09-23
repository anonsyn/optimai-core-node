import { useEffect } from 'react'
import { useLinkedInApi } from './index'

/**
 * Hook to inject LinkedIn API to window object
 * This automatically makes linkedInApi available globally as window.linkedInApi
 */
export const useInjectLinkedInApi = () => {
  const linkedInApi = useLinkedInApi()

  useEffect(() => {
    window.linkedInApi = linkedInApi
    console.log('[LinkedIn] API injected to window.linkedInApi')
  }, [linkedInApi])

  return linkedInApi
}
