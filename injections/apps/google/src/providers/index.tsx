import { OverlayProvider } from '@xagent/overlay'
import { ScrollProvider } from '@xagent/scroll'
import { TerminalProvider } from '@xagent/terminal'
import { GoogleProvider } from './google'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TerminalProvider>
      <OverlayProvider>
        <GoogleProvider>
          <ScrollProvider>{children}</ScrollProvider>
        </GoogleProvider>
      </OverlayProvider>
    </TerminalProvider>
  )
}
