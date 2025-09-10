import { OverlayProvider } from '@xagent/overlay'
import { ScrollProvider } from '@xagent/scroll'
import { TerminalProvider } from '@xagent/terminal'
import { ReactNode } from 'react'
import { PancakeSwapProvider, usePancakeSwapApi } from './pancakeswap'

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TerminalProvider>
      <ScrollProvider>
        <OverlayProvider>
          <PancakeSwapProvider>{children}</PancakeSwapProvider>
        </OverlayProvider>
      </ScrollProvider>
    </TerminalProvider>
  )
}

export { usePancakeSwapApi }
