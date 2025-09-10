import { useInjectGoogleApi } from '@/providers/google'
import { Overlay, useInjectOverlayApi } from '@xagent/overlay'
import { useInjectScrollApi } from '@xagent/scroll'
import { Terminal, useInjectTerminalApi } from '@xagent/terminal'

const App = () => {
  useInjectGoogleApi() // This automatically injects googleApi to window
  useInjectOverlayApi() // This automatically injects overlayApi to window
  useInjectTerminalApi() // This automatically injects terminalApi to window
  useInjectScrollApi() // This automatically injects scrollApi to window

  return (
    <>
      <Overlay />
      <Terminal title="Google Agent Terminal" emptyMessage="No activity yet" />
    </>
  )
}

export default App
