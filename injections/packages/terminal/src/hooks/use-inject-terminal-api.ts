import { useEffect } from 'react'
import { useTerminalApi } from '../providers/terminal'

declare global {
  interface Window {
    terminalApi?: ReturnType<typeof useTerminalApi>
  }
}

/**
 * Hook to inject terminal API into window object
 * This allows external scripts to control the terminal
 */
export const useInjectTerminalApi = () => {
  const terminalApi = useTerminalApi()

  useEffect(() => {
    window.terminalApi = terminalApi

    // Clean up on unmount
    return () => {
      delete window.terminalApi
    }
  }, [terminalApi])

  return terminalApi
}