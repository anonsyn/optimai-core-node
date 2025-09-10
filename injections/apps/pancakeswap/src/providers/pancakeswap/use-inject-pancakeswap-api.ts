import { useEffect } from 'react'
import { usePancakeSwapApi } from './index'

/**
 * Hook to inject PancakeSwap API to window object
 * This automatically makes pancakeSwapApi available globally as window.pancakeSwapApi
 */
export const useInjectPancakeSwapApi = () => {
  const pancakeSwapApi = usePancakeSwapApi()

  useEffect(() => {
    window.pancakeSwapApi = pancakeSwapApi
    console.log('[PancakeSwap] API injected to window.pancakeSwapApi')
  }, [pancakeSwapApi])

  return pancakeSwapApi
}