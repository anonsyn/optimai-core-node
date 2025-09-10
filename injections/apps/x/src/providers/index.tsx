import { OverlayProvider } from '@xagent/overlay'
import { ScrollProvider } from '@xagent/scroll'
import { TerminalProvider } from '@xagent/terminal'
import { ReactNode } from 'react'
import { XProvider } from './x'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <TerminalProvider>
      <ScrollProvider>
        <OverlayProvider>
          <XProvider>{children}</XProvider>
        </OverlayProvider>
      </ScrollProvider>
    </TerminalProvider>
  )
}
