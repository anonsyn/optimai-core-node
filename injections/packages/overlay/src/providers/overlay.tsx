import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

export interface OverlayState {
  isVisible: boolean
}

export interface OverlayApi {
  show: () => void
  hide: () => void
  toggle: () => void
}

const OverlayStateContext = createContext<OverlayState>({
  isVisible: true
})

const OverlayApiContext = createContext<OverlayApi>({
  show: () => {},
  hide: () => {},
  toggle: () => {}
})

export const useOverlayState = () => {
  const context = useContext(OverlayStateContext)
  if (!context) {
    throw new Error('useOverlayState must be used within OverlayProvider')
  }
  return context
}

export const useOverlayApi = () => {
  const context = useContext(OverlayApiContext)
  if (!context) {
    throw new Error('useOverlayApi must be used within OverlayProvider')
  }
  return context
}

interface OverlayProviderProps {
  children: ReactNode
}

export const OverlayProvider = ({ children }: OverlayProviderProps) => {
  const [isVisible, setIsVisible] = useState(true)

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hide = useCallback(() => {
    setIsVisible(false)
  }, [])

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  const state = {
    isVisible
  }

  const api = {
    show,
    hide,
    toggle
  }

  return (
    <OverlayStateContext.Provider value={state}>
      <OverlayApiContext.Provider value={api}>{children}</OverlayApiContext.Provider>
    </OverlayStateContext.Provider>
  )
}
