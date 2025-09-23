import { createContext, ReactNode, useContext, useMemo } from 'react'
import { usePancakeConnector } from './use-pancake-connector'
import { usePancakeExchanger } from './use-pancake-exchanger'

interface PancakeSwapApi {
  connector: ReturnType<typeof usePancakeConnector>
  exchanger: ReturnType<typeof usePancakeExchanger>
}

const PancakeSwapContext = createContext<PancakeSwapApi | null>(null)

export const PancakeSwapProvider = ({ children }: { children: ReactNode }) => {
  const connector = usePancakeConnector()
  const exchanger = usePancakeExchanger()

  const value = useMemo(
    () => ({
      connector,
      exchanger
    }),
    [connector, exchanger]
  )

  return <PancakeSwapContext.Provider value={value}>{children}</PancakeSwapContext.Provider>
}

export const usePancakeSwapApi = () => {
  const context = useContext(PancakeSwapContext)
  if (!context) {
    throw new Error('usePancakeSwapApi must be used within a PancakeSwapProvider')
  }
  return context
}

export { useInjectPancakeSwapApi } from './use-inject-pancakeswap-api'
