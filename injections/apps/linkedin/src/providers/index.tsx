import { OverlayProvider } from '@xagent/overlay'
import { ScrollProvider } from '@xagent/scroll'
import { TerminalProvider } from '@xagent/terminal'
import { LinkedInProvider } from './linkedin'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TerminalProvider>
      <OverlayProvider>
        <LinkedInProvider>
          <ScrollProvider>{children}</ScrollProvider>
        </LinkedInProvider>
      </OverlayProvider>
    </TerminalProvider>
  )
}
