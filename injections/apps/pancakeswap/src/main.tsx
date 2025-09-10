import { Providers } from '@/providers'
import { useInjectPancakeSwapApi } from '@/providers/pancakeswap'
import { Overlay, useInjectOverlayApi } from '@xagent/overlay'
import { useInjectScrollApi } from '@xagent/scroll'
import { Terminal, useInjectTerminalApi } from '@xagent/terminal'

const AppContent = () => {
  useInjectPancakeSwapApi() // This automatically injects pancakeSwapApi to window
  useInjectOverlayApi() // This automatically injects overlayApi to window
  useInjectTerminalApi() // This automatically injects terminalApi to window
  useInjectScrollApi() // This automatically injects scrollApi to window

  return (
    <>
      <Overlay />
      <Terminal title="PancakeSwap Agent Terminal" emptyMessage="No activity yet" />
    </>
  )
}

const App = () => {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}

export default App