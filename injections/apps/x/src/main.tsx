import { useInjectXApi } from '@/providers/x'
import { Overlay, useInjectOverlayApi } from '@xagent/overlay'
import { useInjectScrollApi } from '@xagent/scroll'
import { Terminal, useInjectTerminalApi } from '@xagent/terminal'

const App = () => {
  useInjectXApi() // This automatically injects xApi to window
  useInjectOverlayApi() // This automatically injects overlayApi to window
  useInjectTerminalApi() // This automatically injects terminalApi to window
  useInjectScrollApi() // This automatically injects scrollApi to window

  return (
    <>
      <Overlay />
      <Terminal title="X Agent Terminal" emptyMessage="No activity yet." />
    </>
  )
}

export default App
