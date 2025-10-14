import { DefinedGradient } from '@/components/svgs/defined-gradient'
import { NodeProvider } from '@/providers/node'
import OnlineProvider from '@/providers/online'
import QueryProvider from '@/providers/query'
import ReduxProvider from '@/providers/redux'
import { PropsWithChildren } from 'react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReduxProvider>
      <QueryProvider>
        <NodeProvider>
          <OnlineProvider>{children}</OnlineProvider>
        </NodeProvider>
      </QueryProvider>
    </ReduxProvider>
  )
}

const App = () => {
  return (
    <div className="bg-core-node h-screen w-screen overflow-x-hidden rounded-xl">
      <Outlet />
    </div>
  )
}

const GlobalLayout = () => {
  return (
    <Providers>
      <App />
      <DefinedGradient />
      <Toaster
        richColors
        closeButton
        className="md:![--width:600px] xl:![--width:656px]"
        duration={5000}
        position="bottom-center"
        visibleToasts={1}
      />
    </Providers>
  )
}

export default GlobalLayout
